import express from "express";
import "express-async-errors";
import { config } from "dotenv";
import { validate } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import favoritesRoutes from "./routes/readerRoutes/favoriteRoutes.js";
import crudReader from "./routes/adminRoutes/crudReader.js";
import updatePasswordRoute from "./routes/updatePasswordRoute.js";
import auditLogsRoutes from "./routes/adminRoutes/auditLogs.js";
import devRoutes from "./routes/devRoutes.js";
import { bookRouter } from "./routes/books.route.js";
import {otpRouter} from "./routes/otp.route.js"


config();
validate();

export const app = express();

// safety middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [],
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/books', bookRouter);
app.use('/api/otp', otpRouter);
// app.use('/api/auth', authRouter);
app.use("/auth", authRoutes);
app.use("/reader/favorites", favoritesRoutes);
app.use("/admin/manage/reader", crudReader);
app.use("/admin/manage/", crudReader);
app.use("/update-password", updatePasswordRoute);
app.use("/manage", auditLogsRoutes);
app.use("/dev", devRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
