import dotenv from "dotenv";
dotenv.config(); // Load environment variables first
import http from "http";
import { app } from "./app.js";
import { connectToDB } from "./db/db.js";
import { connect_to_elastic_search, create_index, delete_index } from "./elasticsearch/elasticsearch.js";

const port = process.env.PORT || 6000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectToDB();

    await connect_to_elastic_search()

    await delete_index(process.env.INDEX_NAME);
    await create_index(process.env.INDEX_NAME , true)

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error ", error);
  }
};

startServer();

