import express from "express";
import upload from "../db/multer.js";
import {
  delete_book,
  searchBookBySearchQuery,
  uploadBooks,
  filterBook,
  getBookById,
} from "../controllers/books.controller.js";
import {
  uploadBooksSchema,
  searchSchema,
  filterSchema,
  deleteSchema,
  getBookByIdSchema,
} from "../schema/book.schema.js";
import { validate } from "../validators/books.validate.js";

export const bookRouter = express.Router();

bookRouter.get("/:id", validate(getBookByIdSchema), getBookById);
bookRouter.post("/search", validate(searchSchema), searchBookBySearchQuery);
bookRouter.post(
  "/upload",
  upload.single("file"),
  validate(uploadBooksSchema),
  uploadBooks,
);
bookRouter.post("/filter", validate(filterSchema), filterBook);
bookRouter.delete("/delete/:id", validate(deleteSchema), delete_book);
