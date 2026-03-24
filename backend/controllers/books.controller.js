import { two_pass_hybrid_search } from "../elasticsearch/searchBook.js";
import FormData from "form-data";
import { preprocess_uploaded_file } from "./utils.js";
import { add_data_on_database } from "../db/db.js";
import {
  getBatchEmbeddings,
  processBatch,
} from "../elasticsearch/insertDataIntoElasticSearch.js";
import { filterBooks } from "../elasticsearch/filterBooks.js";
import { create_index, delete_index, is_index_exists } from "../elasticsearch/elasticsearch.js";

const INDEX_NAME = process.env.INDEX_NAME;


export const searchBookBySearchQuery = async (req, res) => {
  try {
    const { search_query } = req.body;
    if (!search_query) {
      return res
        .status(400)
        .json({ error: true, message: "Search query required." });
    }
    const result = await two_pass_hybrid_search(search_query);

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

    // 🔹 Send file to Python server
    const formData = new FormData();

    // ✅ Important: include filename
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const processedData = await preprocess_uploaded_file(formData);
    console.log(processedData[0])

    // add on database
    await add_data_on_database(processedData);

    // 🔹create index
    await create_index(INDEX_NAME);

    //add on elastic search
    const batchSize = 50; // adjust as needed
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      await processBatch(batch);
    }

    return res.status(200).json({
      success: true,
      message: "all done",
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.response?.data || error.message,
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

export const delete_book = async (req, res) => {};
