import dotenv from "dotenv";
dotenv.config(); // Load environment variables first
import http from "http";
import { app } from "./app.js";
import { connectToDB } from "./db/db.js";
import { connect_to_elastic_search, create_index } from "./elasticsearch/elasticsearch.js";
import { connectDB, disconnectDB } from "./config/db.js";

const port = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectToDB();

    await connectDB();

    await connect_to_elastic_search()

    // await create_index(process.env.INDEX_NAME , true)

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error ", error);
  }
};


process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});


startServer();

