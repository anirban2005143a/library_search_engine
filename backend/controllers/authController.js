import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { _isoDateTime } from "zod/v4/core";
import { redis } from "../redis/redis.js";


const DEFAULT_BCRYPT_ROUNDS = 12;
const MIN_BCRYPT_ROUNDS = 10;
const MAX_BCRYPT_ROUNDS = 12;

const BCRYPT_ROUNDS = Math.max(
  MIN_BCRYPT_ROUNDS,
  Math.min(
    Number(process.env.BCRYPT_SALT_ROUNDS) || DEFAULT_BCRYPT_ROUNDS,
    MAX_BCRYPT_ROUNDS,
  ),
);

const isProd = process.env.NODE_ENV === "production";

const sendSuccess = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });

const sendError = (res, message, statusCode = 400) =>
  res.status(statusCode).json({
    status: "error",
    message,
    data: null,
  });

const signRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }

  return jwt.sign(
    { sub: userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
  );
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearAuthCookies = (res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    expires: new Date(0),
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const invalidCredsMsg = "Invalid credentials";

    console.log(email , password)

    if (!email || !password) {
      const error = new Error(invalidCredsMsg);
      error.status = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Never leak whether user exists
    if (!user) {
      const error = new Error(invalidCredsMsg);
      error.status = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      const error = new Error(invalidCredsMsg);
      error.status = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    // Upgrade weak hashes (if existing hash rounds < minimum policy)
    const currentRounds = bcrypt.getRounds(user.password);
    if (currentRounds < MIN_BCRYPT_ROUNDS) {
      const upgradedHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: upgradedHash },
      });
    }

    const accessToken = generateToken(user, res); // pass full user object
    const refreshToken = signRefreshToken(user.id);
    setRefreshTokenCookie(res, refreshToken);

    // createLog({
    //   action: "USER_LOGIN",
    //   entity: "User",
    //   req,
    //   details: {
    //     message: `LOGGED IN AT /*current time*/`
    //   },
    // });

    return sendSuccess(res, "Authenticated", {
      user: {
        id: user.id,
        email: user.email,
      },
      tokens: {
        accessToken,
      },
    });
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingToken) {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      error.code = "TOKEN_INVALID";
      throw error;
    }

    let payload;
    try {
      payload = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      error.code = "TOKEN_EXPIRED";
      throw error;
    }

    if (!payload?.sub || payload?.type !== "refresh") {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      error.code = "TOKEN_INVALID";
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      error.code = "TOKEN_INVALID";
      throw error;
    }

    // Rotate refresh token
    const newRefreshToken = signRefreshToken(user.id);
    setRefreshTokenCookie(res, newRefreshToken);

    const accessToken = generateToken(user.id, res);

    return sendSuccess(res, "Token refreshed", {
      user,
      tokens: {
        accessToken,
      },
    });
  } catch (error) {
    throw error;
  }
};

// logging out means removing auth cookies from the client side
const logout = async (req, res) => {
  clearAuthCookies(res);
  return sendSuccess(res, "Logged out successfully");
};

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

export { login, refreshToken, logout };
