
import { Pool } from "pg";

let pgdbPool = null;

// Define your columns
export const colsRequired = ["title", "author", "publisher", "language", "published_year", "categories", "description", "thumbnail", "pages", "link", "isbn", "location", "availability_status", "id", "format", "type", "reading_level", "average_rating"]

// Connect to DB (called once at startup)
export const connectToDB = async () => {
  if (!pgdbPool) {
    pgdbPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: String(process.env.PG_PASSWORD),
      port: parseInt(process.env.PG_PORT, 10),
    });

    // Optional: test connection
    try {
      const client = await pgdbPool.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("PostgreSQL connected successfully");
    } catch (err) {
      console.error("DB connection failed:", err);
      throw err;
    }
  }
  return pgdbPool;
};

// Getter for the pool (always returns the singleton)
export const pgPool = () => {
  if (!pgdbPool) {
    throw new Error("DB not connected yet. Call connectToDB first.");
  }
  return pgdbPool;
};

export const add_data_on_database = async (data) => {
  if (!pgdbPool) {
    throw new Error("DB not connected yet. Call connectToDB first.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Input data must be an array");
  }

  if (data.length === 0) {
    throw new Error("Data array is empty");
  }

  // Validate that every row has an 'id'
  const missingId = data.find((row) => !row.id);
  if (missingId) {
    throw new Error("Validation Error: All book must have an 'id' field");
  }

  const client = await pgdbPool.connect();
  const tableName = process.env.TABLE_NAME || "temp";

  let transactionStarted = false;
  try {
    // Start transaction
    await client.query("BEGIN");
    transactionStarted = true;

    // Drop the table if it exists
    await client.query(`DROP TABLE IF EXISTS ${tableName};`);

    // Create new table with 'id' as primary key
    const createColumnsSQL = colsRequired
      .map((col) => {
        if (col === "id") return `"${col}" TEXT PRIMARY KEY`;
        return `"${col}" TEXT`;
      })
      .join(", ");

    await client.query(`CREATE TABLE ${tableName} (${createColumnsSQL});`);

    const chunkSize = 100; // 🔥 tune this
    let totalInserted = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      const columns = colsRequired.map((col) => `"${col}"`);
      const values = [];
      const placeholders = [];
      let paramIndex = 1;

      chunk.forEach((row) => {
        const rowPlaceholders = [];

        colsRequired.forEach((col) => {
          values.push(row[col] ?? null);
          rowPlaceholders.push(`$${paramIndex++}`);
        });

        placeholders.push(`(${rowPlaceholders.join(", ")})`);
      });

      const query = `
        INSERT INTO ${tableName} (${columns.join(", ")})
        VALUES ${placeholders.join(", ")};
      `;

      const result = await client.query(query, values);
      totalInserted += result.rowCount || chunk.length;
    }

    await client.query("COMMIT");

    return {
      success: true,
      inserted: totalInserted,
    };
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    console.error("DB Insert Error:", error.message);
    throw new Error("Failed to insert data into database");
  } finally {
    client.release();
  }
};

export const delete_from_pg = async (bookId) => {
  if (!bookId) {
    throw new Error("Book ID is required for deletion");
  }

  const client = await pgPool().connect();
  const tableName = process.env.TABLE_NAME || "temp";

  try {
    const query = `DELETE FROM ${tableName} WHERE "id" = $1`;
    const result = await client.query(query, [bookId]);

    if (result.rowCount === 0) {
      console.warn(`No book found in PG with ID: ${bookId}`);
      throw new Error("Book not found");
    }

    console.log(`Book with ID ${bookId} deleted from PG table ${tableName}`);
    return { success: true, deletedCount: result.rowCount };
  } catch (error) {
    console.error("PostgreSQL Delete Error:", error.message);
    throw new Error("Failed to delete book from database:", error.message);
  } finally {
    client.release();
  }
};

export const get_book_by_id = async(bookId)=>{

  try {
    const query = "SELECT * FROM books WHERE id = $1 LIMIT 1";
    const values = [bookId];

    const result = await pgPool().query(query, values);

    if (result.rows.length === 0) {
      // you can use your CustomError here if you defined one
      throw new Error(`Book with id ${bookId} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.log(error.message)
    throw new Error(error.message || "Error occured. Please try again");
  }
}