"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  WifiOff,
  XCircle,
} from "lucide-react";
import type { BookSearchHit } from "@/utils/books.utils";
import ItemCard from "./ItemCard";
import Loader from "../Loader";

interface ShowBooksProps {
  books: BookSearchHit[];
  isLoading: boolean;
  error: string;
  hasSearched: boolean;
  onRetry: () => void;
  pageSize: number;
  pageSizeOptions: number[];
  currentPage: number;
  onPageSizeChange: (pageSize: number) => void;
  onPageChange: (page: number) => void;
}

export default function ShowBooks({
  books,
  isLoading,
  error,
  hasSearched,
  onRetry,
  pageSize,
  pageSizeOptions,
  currentPage,
  onPageSizeChange,
  onPageChange,
}: ShowBooksProps) {
  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <Loader text="Searching books..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-destructive/20 bg-card px-6 py-10 text-center shadow-sm sm:px-10"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <WifiOff className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Search is temporarily unavailable
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  if (!hasSearched) return null;

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm sm:px-12">
        <XCircle size={42} className="mx-auto mb-4 text-muted-foreground/50" aria-hidden="true" />
        <h2 className="mb-2 text-lg font-semibold text-foreground">No results found</h2>
        <p className="text-sm text-muted-foreground">Try another title, author, or keyword.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(books.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleBooks = books.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const firstResult = (safeCurrentPage - 1) * pageSize + 1;
  const lastResult = Math.min(safeCurrentPage * pageSize, books.length);
  const pageWindowStart = Math.max(
    1,
    Math.min(safeCurrentPage - 2, totalPages - 4),
  );
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => pageWindowStart + index,
  );

  return (
    <section className="min-w-0 space-y-5" aria-label="Search results">
      <AnimatePresence mode="popLayout">
        {visibleBooks.map((book) => (
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
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <label htmlFor="results-page-size">Books per page</label>
          <select
            id="results-page-size"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="ml-1">
            Showing {firstResult}–{lastResult} of {books.length}
          </span>
        </div>
        <nav
          aria-label="Search result pages"
          className="flex flex-wrap items-center justify-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            aria-label="Previous page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          {pageWindowStart > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                aria-label="Page 1"
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                1
              </button>
              {pageWindowStart > 2 && (
                <span aria-hidden="true" className="px-0.5 text-muted-foreground">
                  …
                </span>
              )}
            </>
          )}
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === safeCurrentPage ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition ${
                page === safeCurrentPage
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > pageWindowStart + visiblePages.length - 1 && (
            <>
              {totalPages > pageWindowStart + visiblePages.length && (
                <span aria-hidden="true" className="px-0.5 text-muted-foreground">
                  …
                </span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                aria-label={`Page ${totalPages}`}
                aria-current={safeCurrentPage === totalPages ? "page" : undefined}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition ${
                  safeCurrentPage === totalPages
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            aria-label="Next page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </section>
  );
}