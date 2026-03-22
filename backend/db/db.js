import { Pool } from "pg";

let pgdbPool = null

// Connect to DB (called once at startup)
export const connectToDB = async () => {
  if (!pgdbPool) {
    pgdbPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: String(process.env.PG_PASSWORD),
      port: process.env.PG_PORT,
    });

  }
  return pgdbPool;
};

// Getter for the pool (always returns the singleton)
export const pgPool = () => {
  if (!pgdbPool) {
    throw new Error("DB not connected yet. Call connectToDB first.");
  }
  return pgdbPool;
};

