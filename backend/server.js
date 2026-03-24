import dotenv from "dotenv";
dotenv.config(); // Load environment variables first
import http from "http";
import { app } from "./app.js";
import { connectToDB } from "./db/db.js";
import { connect_to_elastic_search } from "./elasticsearch/elasticsearch.js";

const port = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectToDB();

    await connect_to_elastic_search()

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error ", error);
  }
};

startServer();
