import QueryStream from "pg-query-stream";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pgPool } from "../db/db.js";
import { create_index, delete_index, esClient, is_index_exists } from "./elasticsearch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// --- Constants for Large Scale Migration ---
const BATCH_SIZE = 50; // Number of sentences to send to Python API at once
const INDEX_NAME = process.env.INDEX_NAME;

/**
 * Call FastAPI for embeddings
 */
export const getBatchEmbeddings = async (sentences) => {
  // Validate input
  if (
    !Array.isArray(sentences) ||
    !sentences.every((s) => typeof s === "string")
  ) {
    return null;
  }

  const response = await fetch(`${process.env.EMBEDDING_URL}/embedding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentences }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embeddings;
};

async function migrationFromDatabase() {
  const pgClient = await pgPool.connect();
  try {
    const tableName = process.env.TABLE_NAME;
    // Check if table exists
    const { rows } = await pgClient.query(
      `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
         AND table_name = $1
     )`,
      [tableName],
    );

    if (!rows[0].exists) {
      console.log(`Table "${tableName}" does not exist.`);
      return; // or throw an error / return a response
    }

    // 🔹 Recreate index
    const exists = await is_index_exists(INDEX_NAME);

    if (exists) {
      await delete_index(INDEX_NAME)
      console.log(`Deleted index: ${INDEX_NAME}`);
    }

    await create_index(INDEX_NAME)

    console.log("Index created");

    // 🔹 Stream data
    const stream = pgClient.query(
      new QueryStream(`SELECT * FROM ${tableName}`),
    );

    let batch = [];
    let total = 0;

    for await (const doc of stream) {
      batch.push(doc);

      if (batch.length >= BATCH_SIZE) {
        await processBatch(batch);
        total += batch.length;
        console.log(`Processed: ${total}`);
        batch = [];
      }
    }

    // Process remaining
    if (batch.length > 0) {
      await processBatch(batch);
      total += batch.length;
    }

    console.log(`✅ Migration complete. Total indexed: ${total}`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pgClient.release();
    await pgPool.end();
  }
}

/**
 * Process one batch
 */
export const processBatch = async (batch) => {
  const title_embedding_test = batch.map((doc) =>
    ` ${doc.title}.`.toLowerCase(),
  );

  const context_embedding_text = batch.map((doc) => {
    const categories = doc.categories ? doc.categories.replace(/,/g, ", ") : "";
    const description = doc.description || "";

    return `This book is about ${categories}. It belongs to the categories ${categories}. Description: ${description}`.toLowerCase();
  });

  const title_embedding = await getBatchEmbeddings(title_embedding_test);
  const context_embedding = await getBatchEmbeddings(context_embedding_text);

  const operations = []; // Use a standard array push to be 100% safe

  batch.forEach((doc, i) => {
    if (!title_embedding[i] || !context_embedding[i]) return;

    // Line 1: Action metadata
    operations.push({ index: { _index: INDEX_NAME , _id: doc.id }  });

    // Line 2: The actual document
    operations.push({
      ...doc,
      title_embedding: title_embedding[i],
      title_embedding_copy: title_embedding[i],
      context_embedding: context_embedding[i],
      context_embedding_copy: context_embedding[i],
    });
  });

  if (operations.length === 0) return;

  // Try passing BOTH 'operations' and 'body' or just 'body'
  // depending on your client version
  const result = await esClient().bulk({
    refresh: false,
    body: operations,
  });

  if (result.errors) {
    console.error(
      "Bulk errors detected:",
      JSON.stringify(result.items[0], null, 2),
    );
  }
};

// migrationFromDatabase();

const f = async () => {
  const res = await getBatchEmbeddings(["hary pottre and the filosofer stone"]);
  console.log(res);
};

// f()
