import express from "express";
import upload from "../db/multer.js";
import {
  delete_book,
  searchBookBySearchQuery,
  uploadBooks,
  filterBook,
} from "../controllers/books.controller.js";
import {
  uploadBooksSchema,
  searchSchema,
  filterSchema,
  deleteSchema,
  getBookByIdSchema,
} from "../schema/book.schema.js";
import { get_book_by_id } from "../db/db.js";
import { validate } from "../validators/books.validate.js";

export const bookRouter = express.Router();

bookRouter.get("/book/:id", validate(getBookByIdSchema), get_book_by_id);
bookRouter.post("/search", validate(searchSchema), searchBookBySearchQuery);
bookRouter.post(
  "/upload",
  upload.single("file"),
  validate(uploadBooksSchema),
  uploadBooks,
);
bookRouter.post("/filter", validate(filterSchema), filterBook);
bookRouter.delete("/delete/:id", validate(deleteSchema), delete_book);
