import { tryCatch, Worker } from "bullmq";
import { sendMail } from "./sendmail.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const worker = new Worker(
  `${process.env.MAIL_QUEUE_NAME}`,
  async (job) => {

    console.log("sending mail to ", job.data.email);
    await sendMail(job.data.email, job.data.otp);
    console.log("mail send to ", job.data.email);
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
      `Retrying... (${currentAttempt}/${totalAttempt}) for email: ${job.data.email}`,
    );
  } else {
    console.log(
      `Final failure after ${currentAttempt} attempts for email: ${job.data.email}`,
    );
  }
});
