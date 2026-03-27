import { z } from "zod";

const bookSchema = z.object({
  title: z.string().trim().min(3, "Title must be atleast 3 charecter long"),
  author: z.string().trim().min(3, "Author must be atleast 3 charecter long"),
  categories: z.string().optional().default(""),
  thumbnail: z.string().optional().default("").nullable(),
  description: z.string().optional().default(""),
  pages: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((val) => Number.isFinite(val) && val >= 0, {
      message: "Pages must be a non-negative number",
    })
    .optional(),
  publisher: z.string().optional().default(""),
  language: z.string().optional().default(""),
  link: z.string().optional().default(""),
  published_year: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) =>
      value !== undefined && value !== null ? String(value) : "",
    ),
  isbn: z.string().min(1, "ISBN is required").optional(),
  id: z.string().min(1, "ID is required").optional(),
});

export const uploadBooksSchema = z.object({
  body: z.object({
    books: z.array(bookSchema).optional().default([]),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const searchSchema = z.object({
  body: z.object({
    search_query: z.string().min(1, "Search query required"),
    topK: z.number().int().positive().optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const filterSchema = z.object({
  body: z.object({
    query: z.object({
      categories: z.array(z.string()).optional(),
      title: z.array(z.string()).optional(),
      author: z.array(z.string()).optional(),
      publisher: z.array(z.string()).optional(),
      language: z.array(z.string()).optional(),
      description: z.array(z.string()).optional(),
      isbn: z.array(z.string()).optional(),
      published_year: z
        .union([z.string(), z.number()])
        .optional()
        .transform((value) =>
          value !== undefined && value !== null ? String(value) : "",
        ),
    }),
    size: z.number().int().positive().optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const deleteSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Book ID is required"),
  }),
  query: z.object({}),
  body: z.object({}),
});
