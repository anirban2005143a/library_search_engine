import { Worker } from "bullmq";
import dotenv from "dotenv";

import {
  redisConnection,
  uploading_queue,
} from "./queue.js";

import { processBooksInBatch } from "../elasticsearch/insertBooks.js";

dotenv.config();

const MAX_RETRIES = Number(process.env.MAX_RETRIES) || 3;

export const uploadingWorker = new Worker(
  process.env.UPLOADING_QUEUE_NAME,

  async (job) => {
    console.log(`\n========== Job ${job.id} STARTED ==========`);

    try {
      const { books } = job.data;

      if (!books || !Array.isArray(books) || books.length === 0) {
        throw new Error("Books array not found in job.");
      }

      console.log(`Job ${job.id}: Books received: ${books.length}`);

      // Process the entire batch.
      // processBooksInBatch() returns ONLY the books that failed.
      const failedBooks = await processBooksInBatch(books);

      console.log(
        `Job ${job.id}: Processing finished. ` +
          `Success: ${books.length - failedBooks.length}, ` +
          `Failed: ${failedBooks.length}`,
      );

      // --------------------------------------------------
      // Handle failed books
      // --------------------------------------------------

      if (failedBooks.length > 0) {
        const updatedFailedBooks = failedBooks.map(
          ({ document, item }) => ({
            ...document,

            retryCount: (document.retryCount || 0) + 1,

            lastError: item.index?.error,
          }),
        );

        // Books that still have retries remaining
        const retryBooks = updatedFailedBooks.filter(
          (book) => book.retryCount < MAX_RETRIES,
        );

        // Books that have reached the maximum retry count
        const permanentFailedBooks = updatedFailedBooks.filter(
          (book) => book.retryCount >= MAX_RETRIES,
        );

        // --------------------------------------------------
        // Requeue ONLY failed books
        // --------------------------------------------------

        if (retryBooks.length > 0) {
          await uploading_queue.add("upload-books", {
            books: retryBooks,
          });

          console.log(
            `Job ${job.id}: Requeued ${retryBooks.length} failed book(s).`,
          );
        }

        // --------------------------------------------------
        // Permanently failed books
        // --------------------------------------------------

        if (permanentFailedBooks.length > 0) {
          console.log(
            `Job ${job.id}: ${permanentFailedBooks.length} ` +
              `book(s) permanently failed after ${MAX_RETRIES} attempts.`,
          );

          // TODO:
          // Append permanentFailedBooks to failed_books.json
        }
      }

      console.log(
        `Job ${job.id}: Final result -> ` +
          `Success: ${books.length - failedBooks.length}, ` +
          `Failed: ${failedBooks.length}`,
      );

      console.log(`========== Job ${job.id} FINISHED ==========\n`);

      // IMPORTANT:
      // Do NOT throw here for individual book failures.
      //
      // This tells BullMQ that the job itself completed successfully.
      // Only the failed books are added back to the queue.
    } catch (error) {
      console.error(`Job ${job.id} failed completely.`);
      console.error(error);

      console.log(`========== Job ${job.id} FAILED ==========\n`);

      // This is only for an actual job-level failure.
      //
      // For example:
      // - Invalid job data
      // - processBooksInBatch completely crashes
      // - Elasticsearch connection failure that throws
      //
      // BullMQ will consider the whole job failed and can retry it
      // according to the Queue's attempts configuration.
      throw error;
    }
  },

  {
    connection: redisConnection,

    // Process one BullMQ job at a time
    concurrency: 1,
  },
);

// ======================================================
// BullMQ EVENTS
// ======================================================

uploadingWorker.on("completed", (job) => {
  console.log(`BullMQ: Job ${job.id} completed.`);
});

uploadingWorker.on("failed", (job, err) => {
  console.error(
    `BullMQ: Job ${job?.id} failed after ${job?.attemptsMade} attempt(s).`,
  );

  console.error("Error:", err);
});

uploadingWorker.on("error", (err) => {
  console.error("BullMQ Worker Error:", err);
});

// Optional but useful
uploadingWorker.on("ready", () => {
  console.log("BullMQ uploading worker is ready.");
});

uploadingWorker.on("closed", () => {
  console.log("BullMQ uploading worker closed.");
});