

import { Client } from "@elastic/elasticsearch";
import { Pool } from "pg";
import QueryStream from "pg-query-stream";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export const esClient = new Client({
  node: "https://localhost:9200",
  tls: { rejectUnauthorized: false },
  auth: {
    username: "elastic",
    password: "QT=SQW78hOfqJ9gPWsfc",
  },
});

const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: String("2005@BengaliSwim"),
  port: 5433,
});

// --- Constants for Large Scale Migration ---
const BATCH_SIZE = 50; // Number of sentences to send to Python API at once
const INDEX_NAME = "books";


/**
 * Call FastAPI for embeddings
 */
async function getBatchEmbeddings(sentences) {
  const response = await fetch("http://localhost:8000/embedding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentences }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embeddings;
}

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
      mappings: {
        properties: {
          title: { type: "text" },
          author: { type: "text", fields: { keyword: { type: "keyword" } } },
          categories: { type: "text", fields: { keyword: { type: "keyword" } } },
          description: { type: "text" },
          embedding: {
            type: "dense_vector",
            dims: 768, // ✅ BGE model = 768
            index: true,
            similarity: "cosine",
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
  // 1️⃣ Prepare text
  const texts = batch.map(
    (doc) =>
      `Title: ${doc.title}. Author: ${doc.author}. Categories: ${doc.categories}. Description: ${doc.description}. Publisher: ${doc.publisher}.`
  );

  // 2️⃣ Get embeddings
  const embeddings = await getBatchEmbeddings(texts);

  // 3️⃣ Build bulk body
  const body = [];

  batch.forEach((doc, i) => {
    body.push({
      index: { _index: INDEX_NAME, _id: doc.id },
    });

    body.push({
      ...doc,
      embedding: embeddings[i],
    });
  });

  // 4️⃣ Send to Elasticsearch
  const result = await esClient.bulk({ refresh: false, body });

  if (result.errors) {
    console.error("Bulk insert had errors");
  }
}

migrationFromDatabase();