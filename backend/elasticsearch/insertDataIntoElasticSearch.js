import QueryStream from "pg-query-stream";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pgPool } from "../db/db.js";
import { esClient } from "./elasticsearch.js";
import { getBatchEmbeddings } from "../lib/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// --- Constants for Large Scale Migration ---
const EMBEDDING_BATCH_SIZE = process.env.EMBEDDING_BATCH_SIZE;
const INDEX_NAME = process.env.INDEX_NAME;

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

    console.log("Index created");

    // 🔹 Stream data
    const stream = pgClient.query(
      new QueryStream(`SELECT * FROM ${tableName}`),
    );

    let batch = [];
    let total = 0;

    for await (const doc of stream) {
      batch.push(doc);

      if (batch.length >= EMBEDDING_BATCH_SIZE) {
        await processBatch(batch);
        total += batch.length;
        console.log(`Processed: ${total}`);
        batch = [];
      }
    }

    // Process remaining books
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
  try {
    const title_embedding_text = batch.map((doc) =>
      ` ${doc.title} written by ${doc.author} ${doc.publisher ? `published by ${doc.publisher}` : ""} ${doc.isbn ? `have ISBN: ${doc.isbn}` : ""}`.toLowerCase(),
    );

    const context_embedding_text = batch.map((doc) => {
      const categories = doc.categories
        ? doc.categories.replace(/,/g, ", ")
        : "";
      const description = doc.description || "";

      return `This book is about ${categories}. It belongs to the categories ${categories}. Description: ${description}`.toLowerCase();
    });

    // Generate embeddings
    const [title_embedding, context_embedding] = await Promise.all([
      getBatchEmbeddings(title_embedding_text),
      getBatchEmbeddings(context_embedding_text),
    ]);
    if (
      title_embedding.length !== batch.length ||
      context_embedding.length !== batch.length
    ) {
      throw new Error(
        `Embedding service returned invalid response. Expected ${batch.length}, got Title=${title_embedding.length}, Context=${context_embedding.length}`,
      );
    }

    const operations = []; // Use a standard array push to be 100% safe

    batch.forEach((doc, i) => {
      if (!title_embedding[i] || !context_embedding[i]) {
        throw new Error(
          "Context or Title embedding not found for book ",
          doc.title,
        );
      }

      // Line 1: Action metadata
      operations.push({ index: { _index: INDEX_NAME, _id: doc.id } });

      // Line 2: The actual document
      operations.push({
        ...doc,
        title_embedding: title_embedding[i],
        title_embedding_copy: title_embedding[i],
        context_embedding: context_embedding[i],
        context_embedding_copy: context_embedding[i],
      });
    });

    if (operations.length === 0) return [];

    // Try passing BOTH 'operations' and 'body' or just 'body'
    const result = await esClient().bulk({
      refresh: false,
      body: operations,
    });

    if (result.errors) {
      // Collect only the failed documents
      const failedBooks = result.items
        .map((item, index) => ({
          item,
          document: batch[index],
        }))
        .filter(({ item }) => item.index?.error);

      console.error(
        `Bulk upload failed for ${failedBooks.length} document(s).`,
      );

      // console.error(
      //   JSON.stringify(
      //     failedBooks.map((f) => ({
      //       id: f.document.id,
      //       title: f.document.title,
      //       error: f.item.index.error,
      //     })),
      //     null,
      //     2,
      //   ),
      // );

      return failedBooks;
      // Throw so BullMQ retries the job
      // throw new Error("Elasticsearch bulk upload failed.");
    }

    console.log(`Successfully processed ${batch.length} books.`);

    return [];
  } catch (error) {
    console.error("Error while processing batch:", error);
    throw error;
  }
};

// migrationFromDatabase();

const f = async () => {
  const res = await getBatchEmbeddings(["hary pottre and the filosofer stone"]);
  console.log(res);
};

// f()
