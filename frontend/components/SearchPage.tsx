"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, BookOpenCheck } from "lucide-react";
import SiteNavbar from "./search_page/SiteNavbar";
import SearchBar from "./search_page/SearchBar";
import ShowBooks from "./search_page/ShowBooks";
import {
  BookSearchError,
  searchBooks,
  type BookSearchHit,
} from "@/utils/books.utils";

const SEARCH_STORAGE_KEY = "library-search:last-search";
const SEARCH_EXPIRY_MS = 2 * 60 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20];

interface PersistedSearch {
  query: string;
  intent: string;
  books: BookSearchHit[];
  expiresAt: number;
  pageSize: number;
  currentPage: number;
}

export default function SearchPage() {
  const [books, setBooks] = useState<BookSearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultQuery, setResultQuery] = useState("");
  const [searchIntent, setSearchIntent] = useState("GENERAL_SEARCH");
  const [hasSearched, setHasSearched] = useState(false);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const requestId = useRef(0);

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const savedSearch = sessionStorage.getItem(SEARCH_STORAGE_KEY);
      if (savedSearch) {
        const parsed: PersistedSearch = JSON.parse(savedSearch);
        if (
          typeof parsed.query === "string" &&
          typeof parsed.intent === "string" &&
          Array.isArray(parsed.books) &&
          typeof parsed.expiresAt === "number" &&
          PAGE_SIZE_OPTIONS.includes(parsed.pageSize) &&
          typeof parsed.currentPage === "number" &&
          parsed.currentPage >= 1 &&
          parsed.expiresAt > Date.now()
        ) {
          setBooks(parsed.books);
          setResultQuery(parsed.query);
          setSearchIntent(parsed.intent);
          setPageSize(parsed.pageSize);
          setCurrentPage(parsed.currentPage);
          setHasSearched(true);
        } else {
          sessionStorage.removeItem(SEARCH_STORAGE_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    }
  }, []);

  const handleSearch = async (query: string, intent: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setBooks([]);
      setError("Enter a title, author, or keyword to search.");
      setResultQuery("");
      setHasSearched(true);
      return;
    }

    // Trigger transition state immediately
    const thisRequest = ++requestId.current;
    setHasSearched(true);
    setIsLoading(true);
    setError("");
    setResultQuery(normalizedQuery);
    setSearchIntent(intent);
    setCurrentPage(1);

    await new Promise((res, rej)=>{
      setTimeout(() => {
        res(10)
      }, 5000);
    })

    try {
      const response = await searchBooks(normalizedQuery, intent);
      if (thisRequest !== requestId.current) return;

      const nextBooks = response.books;
      setBooks(nextBooks);
      const persistedSearch: PersistedSearch = {
        query: normalizedQuery,
        intent,
        books: nextBooks,
        expiresAt: Date.now() + SEARCH_EXPIRY_MS,
        pageSize,
        currentPage: 1,
      };
      try {
        sessionStorage.setItem(
          SEARCH_STORAGE_KEY,
          JSON.stringify(persistedSearch),
        );
      } catch {
        // Fallback when storage is disabled
      }
    } catch (searchError) {
      if (thisRequest !== requestId.current) return;
      setBooks([]);
      setError(
        searchError instanceof BookSearchError
          ? searchError.message
          : "Something went wrong while searching. Please try again.",
      );
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    } finally {
      if (thisRequest === requestId.current) setIsLoading(false);
    }
  };

  const persistPagination = (nextPageSize: number, nextPage: number) => {
    try {
      const savedSearch = sessionStorage.getItem(SEARCH_STORAGE_KEY);
      if (!savedSearch) return;

      const parsed: PersistedSearch = JSON.parse(savedSearch);
      sessionStorage.setItem(
        SEARCH_STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          pageSize: nextPageSize,
          currentPage: nextPage,
        } satisfies PersistedSearch),
      );
    } catch {
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    }
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setCurrentPage(1);
    persistPagination(nextPageSize, 1);
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    persistPagination(pageSize, nextPage);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavbar />

      <main
        className={`mx-auto flex w-full max-w-5xl flex-col px-4 pt-6 pb-12 sm:px-6 lg:px-8 ${
          hasSearched ? "" : "-translate-y-10"
        }`}
      >
        <motion.div
          layout
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`flex flex-col w-full ${
            !hasSearched ? "min-h-[calc(100vh-10rem)] justify-center" : ""
          }`}
        >
          {/* Welcome Banner */}
          <AnimatePresence mode="popLayout">
            {!hasSearched && (
              <motion.section
                key="welcome-header"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-8 text-center"
              >
                <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Find a book that{" "}
                  <span className="block font-serif italic text-primary">
                    feels made for you.
                  </span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Search across titles, authors, genres, and more to discover
                  your next favorite.
                </p>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Search Bar Container */}
          <motion.div
            layout="position"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3, ease: "easeOut" },
              y: { duration: 0.3, ease: "easeOut" },
            }}
            className="z-10 w-full"
          >
            <SearchBar
            isLoading={isLoading}
              onSearch={handleSearch}
              initialQuery={resultQuery}
              initialIntent={searchIntent}
            />
          </motion.div>

          {/* Search Hints */}
          <AnimatePresence mode="popLayout">
            {!hasSearched && (
              <motion.div
                key="welcome-hints"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6 text-center"
              >
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpenCheck
                      className="h-3.5 w-3.5 text-primary/80"
                      aria-hidden="true"
                    />
                    Search by title or author
                  </span>
                  <span
                    className="hidden h-1 w-1 rounded-full bg-border sm:block"
                    aria-hidden="true"
                  />
                  <span>Explore by genre, publisher, or ISBN</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/80">
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Start with any book, topic, or author
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Results */}
        {hasSearched && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-6 space-y-5"
            aria-label="Search results"
          >
            {resultQuery && !isLoading && !error && (
              <p className="px-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {books.length} {books.length === 1 ? "result" : "results"}
                </span>{" "}
                for{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{resultQuery}&rdquo;
                </span>
              </p>
            )}

            <ShowBooks
              books={books}
              isLoading={isLoading}
              error={error}
              hasSearched={hasSearched}
              onRetry={() => void handleSearch(resultQuery, searchIntent)}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              currentPage={currentPage}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={handlePageChange}
            />
          </motion.section>
        )}
      </main>
    </div>
  );
}