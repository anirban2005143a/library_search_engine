import { two_pass_hybrid_search } from "../elasticsearch/searchBook.js";
import FormData from "form-data";
import { preprocess_uploaded_file } from "./utils.js";
import { add_data_on_database, delete_from_pg } from "../db/db.js";
import { processBatch } from "../elasticsearch/insertDataIntoElasticSearch.js";
import { filterBooks } from "../elasticsearch/filterBooks.js";
import {
  create_index,
  is_index_exists,
} from "../elasticsearch/elasticsearch.js";
import { getBatchEmbeddings } from "../lib/utils.js";

const INDEX_NAME = process.env.INDEX_NAME;

export const searchBookBySearchQuery = async (req, res) => {
  try {
    console.log("calling search book api");

    const { search_query } = req.body;
    if (!search_query) {
      return res
        .status(400)
        .json({ error: true, message: "Search query required." });
    }
    const result = await two_pass_hybrid_search(search_query);

    console.log("searching done successfully");
    return res.status(200).json({ result, error: false });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const uploadBooks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("calling uploading books api");
    // 🔹 Send file to Python server
    const formData = new FormData();

    // ✅ Important: include filename
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    console.log("processing uploaded books");
    const processedData = await preprocess_uploaded_file(formData);

    console.log("adding books on pg");
    // add on database
    await add_data_on_database(processedData);

    // 🔹create index
    if (!is_index_exists(INDEX_NAME)) await create_index(INDEX_NAME);

    console.log("processing data in batch to insert into elastic search");
    //add on elastic search
    const batchSize = 50; // adjust as needed
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      await processBatch(batch);
    }

    console.log("uploading finished successfully");

    return res.status(200).json({
      success: true,
      message: "all done",
    });
  } catch (error) {
    console.error("Error while uploading books:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
      error: error.response?.data || error,
    });
  }
};

export const filterBook = async (req, res) => {
  try {
    const { query, size } = req.body;

    // Basic validation
    if (!query || typeof query !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing query criteria",
      });
    }

    const parsedSize = size ? parseInt(size, 10) : 10;

    if (isNaN(parsedSize) || parsedSize <= 0) {
      return res.status(400).json({
        success: false,
        message: "Size must be a positive number",
      });
    }

    // Page is always 1
    const page = 1;

    //generate embedding for query
    if (query["categories"])
      query["categories"] = query["categories"].map((val) => val.toLowerCase());

    const queryEmbeddings = await getBatchEmbeddings(data["categories"]);

    // Call your filtering function
    const data = await filterBooks(query, parsedSize, page, queryEmbeddings);

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      data,
    });
  } catch (error) {
    console.error("Error in filterBook:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const delete_book = async (req, res) => {
  const { id } = req.params; // Assumes route is something like /books/:id

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Book ID is required for deletion.",
    });
  }

  try {
    // delete from pg
    await delete_from_pg(id);

    // delete from elastic search
    await delete_book_from_elasticsearch(INDEX_NAME, id);

    return res.status(200).json({
      success: true,
      message: `Book with ID ${id} deleted successfully from DB and Search Index.`,
    });
    
  } catch (error) {
    console.error("Elasticsearch Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the book.",
    });
  }
};
