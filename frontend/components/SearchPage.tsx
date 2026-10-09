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
  const [isReady, setIsReady] = useState(false);
  const requestId = useRef(0);

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
    } finally {
      setIsReady(true);
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

    const thisRequest = ++requestId.current;
    setIsLoading(true);
    setError("");
    setResultQuery(normalizedQuery);
    setSearchIntent(intent);
    setHasSearched(true);
    setCurrentPage(1);

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
        // The search results remain usable even when browser storage is unavailable.
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
      <main className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 sm:px-6 lg:px-8">
        {!isReady ? (
          <div
            aria-label="Restoring your search"
            aria-busy="true"
            className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl items-center justify-center"
          >
            <div className="h-[68px] w-full max-w-3xl animate-pulse rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-primary/5" />
          </div>
        ) : (
          <div className="relative mx-auto min-h-[calc(100svh-4rem)] max-w-5xl">
            <AnimatePresence initial={false}>
              {!hasSearched && (
                <motion.section
                  key="welcome"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="inset-x-0 top-[21%] px-2 text-center sm:top-[22%]"
                >
                  <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Find a book that
                    <span className="block font-serif italic text-primary">
                      feels made for you.
                    </span>
                  </h1>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Search across titles, authors, genres, and more to discover
                    your next favorite.
                  </p>
                </motion.section>
              )}
            </AnimatePresence>

            <motion.div
              layout="position"
              transition={{ layout: { duration: 0.32, ease: "easeInOut" } }}
              className={` my-5 inset-x-0 z-10 mx-auto w-full max-w-3xl transition-[top,transform] duration-300 ease-out motion-reduce:transition-none ${
                hasSearched ? "top-4" : "top-[53%] "
              }`}
            >
              <SearchBar
                onSearch={handleSearch}
                initialQuery={resultQuery}
                initialIntent={searchIntent}
              />
            </motion.div>

            <AnimatePresence initial={false}>
              {!hasSearched && (
                <motion.div
                  key="welcome-hints"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="inset-x-0 top-[calc(53%+56px)] flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 text-xs text-muted-foreground">
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
                    <span>Explore by genre, publisher, or ISBN</span>{" "}
                  </div>
                  <div className="mt-3 inset-x-0 top-[calc(53%+100px)] flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/80">
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    Start with any book, topic, or author
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasSearched && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="space-y-5 pb-8 pt-28"
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
          </div>
        )}
      </main>
    </div>
  );
}
