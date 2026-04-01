import { getBatchEmbeddings } from "../lib/utils.js";
import { esClient } from "./elasticsearch.js";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const INDEX_NAME = process.env.INDEX_NAME;

export const process_uploaded_books = async (batch) => {
  try {
    if (!doc.id) {
      throw new Error(`Missing document id for book ${doc.title}`);
    }

    const title_embedding_test = batch.map((doc) =>
      `${doc.type || ""} ${doc.title || ""} written by ${doc.author || ""} ${
        doc.publisher ? `published by ${doc.publisher}` : ""
      } ${doc.isbn ? `have ISBN: ${doc.isbn}` : ""} ${
        doc.reading_level ? `for ${doc.reading_level}` : ""
      } ${doc.format ? `with format ${doc.format}` : ""}`.toLowerCase(),
    );

    const context_embedding_text = batch.map((doc) => {
      const categories = doc.categories
        ? doc.categories
            .split(",")
            .map((c) => c.trim())
            .join(", ")
        : "";
      const description = doc.description || "";

      const contextText =
        categories || description
          ? `This book is about ${categories}. Description: ${description}`
          : "No description available for this book";

      return contextText.toLowerCase();
    });

    const [title_embedding, context_embedding] = await Promise.all([
      getBatchEmbeddings(title_embedding_test),
      getBatchEmbeddings(context_embedding_text),
    ]);
    const operations = []; // Use a standard array push to be 100% safe

    if (
      title_embedding.length !== batch.length ||
      context_embedding.length !== batch.length
    ) {
      throw new Error("Embedding batch size mismatch");
    }

    batch.forEach((doc, i) => {
      if (
        !Array.isArray(title_embedding[i]) ||
        !Array.isArray(context_embedding[i]) ||
        title_embedding[i].length === 0 ||
        context_embedding[i].length === 0
      ) {
        throw new Error(`Invalid embedding for book ${doc.title}`);
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

    if (operations.length === 0) return;

    // Try passing BOTH 'operations' and 'body' or just 'body'
    // depending on your client version
    const result = await esClient().bulk({
      refresh: false,
      body: operations,
    });

    if (result.errors) {
      console.error("Bulk errors:", JSON.stringify(failedItems[0], null, 2));
      handleError();
    }
  } catch (error) {
    console.log("Error while bulk inserting in elastic search", error);
    throw new Error(`Error while bulk inserting in elastic search ${error}`);
  }
};

const handleError = (result) => {
  if (!result) return;

  // Extract failed documents
  const failedItems = result.items
    .map((item, idx) => {
      if (item.index?.error) {
        return {
          ...batch[idx], // spread all fields from the document
          error: item.index.error, // add the Elasticsearch error info
        };
      }
      return null;
    })
    .filter(Boolean);

  if (failedItems.length > 0) {
    // console.error("Bulk errors:", JSON.stringify(failedItems[0], null, 2));

    // Define a file path for failed docs
    const filePath = path.join(process.cwd(), "failed_books.json");

    // Check if file exists; if yes, append; otherwise create
    let existing = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      existing = JSON.parse(raw);
    }

    // Append new failures
    const allFailed = existing.concat(failedItems);

    // Write back to JSON file
    fs.writeFileSync(filePath, JSON.stringify(allFailed, null, 2), "utf-8");

    console.log(`${failedItems.length} failed docs saved to ${filePath}`);
  }
};
