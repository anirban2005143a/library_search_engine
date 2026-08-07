import { Worker } from "bullmq";
import dotenv from "dotenv";

import { redisConnection } from "./queue.js";
import { processBatch } from "../elasticsearch/insertDataIntoElasticSearch.js";

dotenv.config();

export const uploadingWorker = new Worker(
  process.env.UPLOADING_QUEUE_NAME,

  async (job) => {
    try {
      console.log(`Processing Job ${job.id}`);

      const { books } = job.data;

      if (!books || !Array.isArray(books) || books.length === 0) {
        throw new Error("Books array not found in job.");
      }

      // Each job already contains one batch
      const failedBooks = await processBatch(books);

      if (failedBooks.length > 0) {
        const updatedFailedBooks = failedBooks.map((book) => ({
          ...book,
          retryCount: (book.retryCount || 0) + 1,
        }));

        const retryBooks = updatedFailedBooks.filter(
          (book) => book.retryCount < 3,
        );
        const permanentFailedBooks = updatedFailedBooks.filter(
          (book) => book.retryCount >= 3,
        );

        if (retryBooks.length) {
          await uploading_queue.add("upload-books", {
            books: retryBooks,
          });
        }

        if (permanentFailedBooks.length) {
          // TODO:
          // append permanentFailedBooks to failed_books.json
        }
      }

      console.log(
        `Job ${job.id} processed. Success: ${books.length - failedBooks.length}, Failed: ${failedBooks.length}`,
      );
    } catch (error) {
      console.error(`Job ${job.id} failed`, err);
      throw err;
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
