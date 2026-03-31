import { redis } from "../redis/redis.js";

export const ChangePasswordController = async (req, res) => {
  try {
    const { password, email, otp } = req.body;

    //check otp validation
    const storedOtp = await redis.get(`otp:${email}`);

    // check otp
    if (!storedOtp)
      return res
        .status(400)
        .json({ error: true, message: "Failed to verify OTP" });
    if (storedOtp !== otp)
      return res.status(400).json({ error: true, message: "Incorrect OTP" });

    //otp verified , delete otp from redis
    await redis.del(`otp:${email}`);


    //hash password and update password to db
    await new Promise((res, rej) => {
      setTimeout(() => {
        res(6);
      }, 5000);
    });

    console.log("new password " , password)

    return res
      .status(200)
      .json({ error: false, message: "Password updated successfully" });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something went wrong. Please try again",
    });
  }
};
