import express from "express";
import upload from "../db/multer.js";
import { validate } from "../middlewares/validate.js";
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
} from "../validator/upload_book.js";

export const bookRouter = express.Router();

bookRouter.post("/search", validate(searchSchema), searchBookBySearchQuery);
bookRouter.post(
  "/upload",
  upload.single("file"),
  validate(uploadBooksSchema),
  uploadBooks,
);
bookRouter.post("/filter", validate(filterSchema), filterBook);
bookRouter.delete("/delete/:id", validate(deleteSchema), delete_book);

