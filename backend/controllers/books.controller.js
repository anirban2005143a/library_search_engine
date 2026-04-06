import FormData from "form-data";
import { preprocess_uploaded_file } from "./utils.js";
import { add_data_on_database, delete_from_pg } from "../db/db.js";
import { processBatch } from "../elasticsearch/insertDataIntoElasticSearch.js";
import { filterBooks } from "../elasticsearch/filterBooks.js";
import { delete_book_from_elasticsearch } from "../elasticsearch/deleteBooks.js";
import {
  create_index,
  is_index_exists,
} from "../elasticsearch/elasticsearch.js";
import { getBatchEmbeddings } from "../lib/utils.js";
import { v4 } from "uuid";
import { search_book_with_page_number } from "../elasticsearch/searchBook.js";

const INDEX_NAME = process.env.INDEX_NAME;

export const searchBookBySearchQuery = async (req, res) => {
  try {
    console.log("calling search book api");

    const { search_query, searchId, pageNo , filters , intent} = req.validated?.body || req.body;
    console.log(search_query, pageNo , intent);

    const result = await search_book_with_page_number(
      search_query,
      searchId,
      intent,
      5,
      5,
      pageNo,
    );

    console.log("searching done successfully");
    return res.status(200).json({ result, error: false });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: true,result:[], message: error.message });
  }
};

export const uploadBooks = async (req, res) => {
  try {
    console.log("calling uploading books api");

    let bookList = [];

    if (req.file) {
      // existing CSV/file upload path
      const formData = new FormData();
      formData.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const processedData = await preprocess_uploaded_file(formData);
      if (!Array.isArray(processedData) || processedData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Uploaded file must include valid book records",
        });
      }
      bookList = processedData;
    } else if (req.validated?.body?.books) {
      bookList = req.validated.body.books;
    } else if (req.body?.books) {
      bookList = req.body.books;
    } else {
      return res.status(400).json({
        success: false,
        message: "Upload request must contain either a file or books payload",
      });
    }

    if (!Array.isArray(bookList) || bookList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Book array must not be empty",
      });
    }

    // add id field
    bookList.forEach((book) => {
      if (!book.id) {
        book.id = v4();
      }
    });

    // Save to DB
    await add_data_on_database(bookList);

    // Ensure index exists
    if (!is_index_exists(INDEX_NAME)) await create_index(INDEX_NAME);

    // Batch insert into elasticsearch
    const batchSize = 50;
    for (let i = 0; i < bookList.length; i += batchSize) {
      const batch = bookList.slice(i, i + batchSize);
      await processBatch(batch);
    }

    console.log("uploading finished successfully");

    return res.status(200).json({
      success: true,
      message: "all done",
      uploaded: bookList.length,
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
    const { query, size } = req.validated?.body || req.body;

    if (!query || typeof query !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing query criteria",
      });
    }

    const parsedSize = size ? Number(size) : 10;

    if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
      return res.status(400).json({
        success: false,
        message: "Size must be a positive number",
      });
    }

    const page = 1;

    let queryEmbeddings = null;
    if (query.categories) {
      let categories = Array.isArray(query.categories)
        ? query.categories
        : [query.categories];
      categories = categories.map((val) => String(val).toLowerCase());
      query.categories = categories;
      queryEmbeddings = await getBatchEmbeddings(categories);
    }

    const result = await filterBooks(query, parsedSize, page, queryEmbeddings);

    return res.status(200).json({
      success: true,
      count: result?.length || 0,
      data: result,
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
  const { id } = req.validated?.params || req.params;

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
