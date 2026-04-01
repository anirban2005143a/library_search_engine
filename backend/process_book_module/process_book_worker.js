import {  Worker } from "bullmq";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ProcessBooks } from "./process_books.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const worker = new Worker(
  `${process.env.UPLOADING_QUEUE_NAME}`,
  async (job) => {

    console.log("uploading batch : ", job.data.batch_no);
    await ProcessBooks(job.data.batch);
    console.log("successfully upload : ", job.data.batch_no);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

worker.on("failed", (job) => {
  const currentAttempt = job.attemptsMade;
  const totalAttempt = job.opts.attempts;

  if (currentAttempt < totalAttempt) {
    console.log(
      `Retrying... (${currentAttempt}/${totalAttempt}) for batch: ${job.data.batch_no} of Upload-ID: ${job.data.uploadId}`,
    );
  } else {
    console.log(
      `Final failure after ${currentAttempt} attempts of batch: ${job.data.batch_no} of Upload-ID: ${job.data.uploadId}`,
    );
  }
});
