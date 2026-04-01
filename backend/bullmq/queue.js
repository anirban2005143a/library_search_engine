import { Queue } from "bullmq";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export const mail_queue = new Queue(`${process.env.MAIL_QUEUE_NAME}`, {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});

export const uploading_queue = new Queue(`${process.env.UPLOADING_QUEUE_NAME}`, {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});
