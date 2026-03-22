import { Client } from "@elastic/elasticsearch";
import { Pool } from "pg";
import QueryStream from "pg-query-stream";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { VECTOR_GAP_SYNONYMS } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export const esClient = new Client({
  node: process.env.ELASTIC_SEARCH_URL,
  tls: { rejectUnauthorized: false },
  auth: {
    username: process.env.ELASTIC_SEARCH_USER,
    password: String(process.env.ELASTIC_SEARCH_PASS),
  },
});

const pgPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: String(process.env.PG_PASSWORD),
  port: process.env.PG_PORT,
});

// --- Constants for Large Scale Migration ---
const BATCH_SIZE = 50; // Number of sentences to send to Python API at once
const INDEX_NAME = process.env.INDEX_NAME;

/**
 * Call FastAPI for embeddings
 */
export const getBatchEmbeddings = async (sentences) => {
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
    // 🔹 Recreate index
    const exists = await esClient.indices.exists({ index: INDEX_NAME });

    if (exists) {
      await esClient.indices.delete({ index: INDEX_NAME });
      console.log(`Deleted index: ${INDEX_NAME}`);
    }

    await esClient.indices.create({
      index: INDEX_NAME,
      settings: {
        analysis: {
          filter: {
            my_synonyms: {
              type: "synonym_graph",
              synonyms: VECTOR_GAP_SYNONYMS,
            },
            my_stemmer: {
              type: "stemmer",
              name: "english",
            },
          },
          analyzer: {
            // 1. Used when storing the 68k books (No synonyms here)
            my_index_analyzer: {
              tokenizer: "standard",
              filter: ["lowercase", "my_stemmer"],
            },
            // 2. Used only when a user types in the search bar
            my_search_analyzer: {
              tokenizer: "standard",
              filter: ["lowercase", "my_synonyms", "my_stemmer"],
            },
          },
        },
      },
      mappings: {
        properties: {
          title: {
            type: "text",
            analyzer: "my_index_analyzer",
            search_analyzer: "my_search_analyzer",
          },
          author: {
            type: "text",
            fields: { keyword: { type: "keyword" } },
            analyzer: "my_index_analyzer",
            search_analyzer: "my_search_analyzer",
          },
          categories: {
            type: "text",
            fields: { keyword: { type: "keyword" } },
            analyzer: "my_index_analyzer",
            search_analyzer: "my_search_analyzer",
          },
          description: {
            type: "text",
            analyzer: "my_index_analyzer",
            search_analyzer: "my_search_analyzer",
          },
          publisher: {
            type: "text",
            fields: { keyword: { type: "keyword" } },
          },
          published_year: {
            type: "text",
            fields: { keyword: { type: "keyword" } },
          },
          isbn: {
            type: "text",
            // fields: { keyword: { type: "keyword" } },
          },
          embedding: {
            type: "dense_vector",
            dims: 768, // ✅ BGE model = 768
            index: true,
            similarity: "cosine",
          },
          embedding_copy: {
            type: "float",
            index: false,
          },
        },
      },
    });

    console.log("Index created");

    // 🔹 Stream data
    const stream = pgClient.query(new QueryStream("SELECT * FROM books"));

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
async function processBatch(batch) {
  const texts = batch.map(
    (doc) =>
      `Title: ${doc.title}. Author: ${doc.author}. Categories: ${doc.categories}. Description: ${doc.description}. Publisher: ${doc.publisher}.`,
  );

  const embeddings = await getBatchEmbeddings(texts);

  const operations = []; // Use a standard array push to be 100% safe

  batch.forEach((doc, i) => {
    if (!embeddings[i]) return;

    // Line 1: Action metadata
    operations.push({ index: { _index: INDEX_NAME } });

    // Line 2: The actual document
    operations.push({
      ...doc,
      embedding: embeddings[i],
      embedding_copy: embeddings[i],
    });
  });

  if (operations.length === 0) return;

  // Try passing BOTH 'operations' and 'body' or just 'body'
  // depending on your client version
  const result = await esClient.bulk({
    refresh: false,
    body: operations,
  });

  if (result.errors) {
    console.error(
      "Bulk errors detected:",
      JSON.stringify(result.items[0], null, 2),
    );
  }
}

// migrationFromDatabase();

const f = async () => {
  const res = await getBatchEmbeddings(["hary pottre and the filosofer stone"]);
  console.log(res);
};

// f()
