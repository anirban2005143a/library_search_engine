import "dotenv/config";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected via Prisma");
  } catch (error) {
    console.log(`Database connection error: ${error.message}`);
    process.exit(1); // immediately stops the app and tells the system that it stopped due to an error
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
