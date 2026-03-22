import express from "express";
export const bookRouter = express.Router()
import { searchBookBySearchQuery } from "../controllers/books.controller.js";

bookRouter.post("/search", searchBookBySearchQuery);

