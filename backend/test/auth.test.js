import request from "supertest";
import express from "express";
import "express-async-errors";
import { config } from "dotenv";

config();

// Import routes and middleware
import authRoutes from "../src/routes/authRoutes.js";
import {
  errorHandler,
  notFoundHandler,
} from "../src/middleware/errorHandler.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Create test app
const createTestApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/auth", authRoutes);
  app.use("/health", (req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe("Auth Routes", () => {
  let app;
  let mockPrisma;

  beforeEach(() => {
    app = createTestApp();
    // Get mocked prisma from db config
  });

  describe("POST /auth/login", () => {
    test("should successfully login with valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("data.user");
      expect(response.body).toHaveProperty("data.tokens.accessToken");
    });

    test("should return 401 for non-existent user", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error.code", "INVALID_CREDENTIALS");
    });

    test("should return 401 for invalid password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user@example.com",
        password: "WrongPassword123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error.code", "INVALID_CREDENTIALS");
    });

    test("should return uniform error message for missing credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user@example.com",
        // missing password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message"); // Validation error
    });

    test("should validate email format", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalid-email",
        password: "Password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    test("should validate password requirements", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user@example.com",
        password: "short", // Too short, no uppercase, no number
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /auth/logout", () => {
    test("should successfully logout", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty(
        "message",
        "Logged out successfully",
      );
    });
  });

  describe("404 Handling", () => {
    test("should return 404 for unknown route", async () => {
      const response = await request(app).get("/unknown/route");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error.code", "ROUTE_NOT_FOUND");
    });
  });

  describe("Error Handling", () => {
    test("should return standardized error format", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalid",
        password: "too short",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("success");
    });
  });
});
