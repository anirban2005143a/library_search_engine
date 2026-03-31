import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});


export const sendMail = async (email, otp) => {
  const auth = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "webdevpurpose21@gmail.com",
      pass: process.env.MAIL_SERVICE_PASSWORD,
    },
  });

  const receiver = {
    from: "webdevpurpose21@gmail.com",
    to: email,
    subject: `OTP verification from Library Search Engine`,
    text: `Your OTP is ${otp}`,
    html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <h2 style="color: #333;">📚 Library Search Engine</h2>
      
      <p style="font-size: 16px; color: #555;">
        Hello,<br/><br/>
        Use the OTP below to complete your verification process.
      </p>

      <div style="margin: 30px 0;">
        <span style="
          display: inline-block;
          font-size: 28px;
          letter-spacing: 8px;
          font-weight: bold;
          color: #ffffff;
          background: #4CAF50;
          padding: 12px 25px;
          border-radius: 8px;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size: 14px; color: #777;">
        This OTP is valid for a short time. Do not share it with anyone.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #aaa;">
        If you didn’t request this, you can safely ignore this email.
      </p>

    </div>
  </div>
  `,
  };

  console.log(email, otp);

  try {
    const info = await auth.sendMail(receiver);
    return "success!";
  } catch (error) {
    console.log(error);
    throw new Error("Some error occured");
  }
};


// sendMail("dasanirban268@gmail.com" , 12345)