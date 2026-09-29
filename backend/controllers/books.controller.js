import FormData from "form-data";
import { preprocess_uploaded_file } from "./utils.js";
import {
  add_data_on_database,
  delete_from_pg,
  get_book_by_id,
} from "../db/db.js";
import { filterBooks } from "../elasticsearch/filterBooks.js";
import { delete_book_from_elasticsearch } from "../elasticsearch/deleteBooks.js";
import {
  create_index,
  is_index_exists,
} from "../elasticsearch/elasticsearch.js";
import { getBatchEmbeddings } from "../lib/utils.js";
import { v4 } from "uuid";
import { search_book_with_page_number } from "../elasticsearch/searchBook.js";

import { uploading_queue } from "../bullmq/queue.js";

const INDEX_NAME = process.env.INDEX_NAME;
const BATCH_SIZE = Number(process.env.UPLOADING_BATCH_SIZE) || 100;

export const searchBookBySearchQuery = async (req, res) => {
  try {
    console.log("calling search book api");

    const { search_query, searchId, pageNo, filters, intent } =
      req.validated?.body || req.body;
    console.log(search_query, pageNo, intent);

    const result = await search_book_with_page_number(
      search_query,
      searchId,
      intent,
      5,
      5,
      pageNo,
    );

    console.log("searching done successfully");
    return res.status(200).json({ ...result, error: false });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ error: true, books: [], message: error.message });
  }
};

export const uploadBooks = async (req, res) => {
  try {
    console.log("Calling upload books API");

    let bookList = [];

    if (req.file) {
      const formData = new FormData();

      formData.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const processedData = await preprocess_uploaded_file(formData);

      if (!Array.isArray(processedData) || processedData.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Invalid response from preprocessing service",
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

    // Attach unique IDs
    const formattedBooks = bookList.map((book) => ({
      ...book,
      id: book.id || v4(),
      retryCount: 0,
    }));

    // Save metadata to database
    await add_data_on_database(formattedBooks);

    console.log("Insert in db");

    // Ensure Elasticsearch index exists
    if (!(await is_index_exists(INDEX_NAME))) {
      await create_index(INDEX_NAME);
    }

    console.log("=================================");
    console.log("BATCH_SIZE =", BATCH_SIZE);
    console.log("formattedBooks.length =", formattedBooks.length);
    console.log("=================================");

    // Add upload jobs to BullMQ
    const jobIds = [];

    for (let i = 0; i < formattedBooks.length; i += BATCH_SIZE) {
      const batch = formattedBooks.slice(i, i + BATCH_SIZE);

      console.log(`Adding batch to BullMQ: ${batch.length} books`);

      const job = await uploading_queue.add("upload-books", {
        books: batch,
      });

      jobIds.push(job.id);
    }

    console.log(
      `Queued ${formattedBooks.length} books in ${jobIds.length} job(s).`,
    );

    return res.status(202).json({
      success: true,
      message: "Books queued successfully. Upload started in background.",
      jobIds,
      queued: formattedBooks.length,
    });
  } catch (error) {
    console.error("Error while uploading books:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
      error,
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

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) throw new Error("Please provide a ID");

    const book = await get_book_by_id(id);

    return res.status(200).json({
      error: false,
      book: book,
      message: "Successfully found the book",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message || "Somthing went wrong. Please try again",
    });
  }
};
