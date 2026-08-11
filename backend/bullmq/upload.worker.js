import { Worker } from "bullmq";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { redisConnection } from "./queue.js";
import { processBooksInBatch } from "../elasticsearch/insertBooks.js";

dotenv.config();

// Define local tracking files
const READY_FILE = path.join(process.cwd(), "ready_books.json");
const PROCESSING_FILE = path.join(process.cwd(), "processing_books.json");
const SUCCESS_FILE = path.join(process.cwd(), "success_books.json");
const FAILED_FILE = path.join(process.cwd(), "failed_books.json");

const MAX_RETRIES = process.env.MAX_RETRIES;

export const uploadingWorker = new Worker(
  process.env.UPLOADING_QUEUE_NAME,

  async (job) => {
    try {
      console.log(`Processing Job ${job.id}`);

      const { books } = job.data;

      if (!books || !Array.isArray(books) || books.length === 0) {
        throw new Error("Books array not found in job.");
      }

      const failedBooks = await processBooksInBatch(books);

      if (failedBooks.length > 0) {
        const updatedFailedBooks = failedBooks.map(({ document, item }) => ({
          ...document,
          retryCount: (document.retryCount || 0) + 1,
          lastError: item.index?.error,
        }));

        const retryBooks = updatedFailedBooks.filter(
          (book) => book.retryCount < MAX_RETRIES,
        );

        const permanentFailedBooks = updatedFailedBooks.filter(
          (book) => book.retryCount >= MAX_RETRIES,
        );

        // Retry ONLY failed books
        if (retryBooks.length > 0) {
          await uploading_queue.add("upload-books", {
            books: retryBooks,
          });

          console.log(`Requeued ${retryBooks.length} failed book(s).`);
        }

        // Permanently failed books
        if (permanentFailedBooks.length > 0) {
          console.log(
            `${permanentFailedBooks.length} book(s) permanently failed.`,
          );

          // TODO:
          // append permanentFailedBooks to failed_books.json
        }
      }

      console.log(
        `Job ${job.id} processed. Success: ${
          books.length - failedBooks.length
        }, Failed: ${failedBooks.length}`,
      );
    } catch (error) {
      console.error(`Job ${job.id} failed`, error);

      // This is important.
      // BullMQ sees the thrown error and retries the ENTIRE job/batch.
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process one BullMQ job at a time
  },
);

// ---------------------- Events ----------------------

uploadingWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed.`);
});

uploadingWorker.on("failed", (job, err) => {
  console.error(
    `Job ${job?.id} failed after ${job?.attemptsMade} attempt(s).`,
    err,
  );
});

uploadingWorker.on("error", (err) => {
  console.error("BullMQ Worker Error:", err);
});
