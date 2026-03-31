import { queue } from "../bullmq/queue.js";
import { redis } from "../redis/redis.js";
import crypto from "crypto";

export const generateOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Please provide email" });

    //generate random 6 digit otp
    const otp = crypto.randomInt(100000, 1000000);

    //store to redis with the email
    await redis.setex(`email:${email}`, 300, otp.toString());

    //drop the otp to email-queue for sending email
    await queue.add("send-otp", {
      email: email,
      otp: otp,
    },{
      attempts:3,
      backoff:{
        type:"exponential",
        delay:1000
      },
      removeOnComplete:true,
      removeOnFail:true
    }
  );
    console.log("job added to queue ", email , otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log("error while generate otp", error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const getFailedJobs = async(req , res)=>{
  try {
    const failedJobs = await queue.getFailed()
    return res.json({failedJobs})
  } catch (error) {
    return res.status(500).json({message : error.message})
  }
}