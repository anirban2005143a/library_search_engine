import { jest } from "@jest/globals";

// Mock Prisma client globally before any tests run
jest.unstable_mockModule("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    favorites: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    prisma: mockPrisma,
  };
});

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-for-testing";
process.env.JWT_EXPIRES_IN = "7d";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.PORT = "5001";
process.env.BCRYPT_SALT_ROUNDS = "10";
process.env.CORS_ORIGIN = "http://localhost:3000";
