import { Worker } from "bullmq";
import { sendMail } from "./sendmail.js";

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log("sending mail to " , email)
    await sendMail(job.email, job.otp);
    console.log("mail send to ", job.email);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
)
