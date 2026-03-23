import express from "express";
import upload from "../db/multer.js";
import { searchBookBySearchQuery, uploadBooks } from "../controllers/books.controller.js";

export const bookRouter = express.Router()

bookRouter.post("/search", searchBookBySearchQuery);
bookRouter.post("/upload", upload.single("file"), uploadBooks);

