"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import type { BookSearchHit } from "@/utils/books.utils";
import ItemCard from "./ItemCard";
import Loader from "../Loader";

interface ShowBooksProps {
  books: BookSearchHit[];
  isLoading: boolean;
  error: string;
}

export default function ShowBooks({ books, isLoading, error }: ShowBooksProps) {
  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <Loader text="Searching books..." />
      </div>
    );
  }

  if (error) {
    return <p role="alert" className="py-6 text-center text-sm text-destructive">{error}</p>;
  }

  if (books.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <XCircle size={40} className="mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="mb-1 text-base font-semibold text-foreground">No results found</h2>
        <p className="text-sm text-muted-foreground">Try another title, author, or keyword.</p>
      </div>
    );
  }

  return (
    <section className="min-w-0 space-y-4" aria-label="Search results">
      <AnimatePresence mode="popLayout">
        {books.map((book) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ItemCard book={book} />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}