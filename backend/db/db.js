import { Pool } from "pg";

let pgdbPool = null;

// Define your columns
export const colsRequired = [
  "title",
  "author",
  "categories",
  "thumbnail",
  "description",
  "pages",
  "publisher",
  "language",
  "link",
  "published_year",
  "isbn",
  "id"
];

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
