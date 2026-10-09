"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SearchBar from "./search_page/SearchBar";
import ShowBooks from "./search_page/ShowBooks";
import SiteNavbar from "./search_page/SiteNavbar";
import { ArrowDown, BookOpenCheck, Sparkles } from "lucide-react";
import { searchBooks, type BookSearchHit } from "@/utils/books.utils";

const SEARCH_STORAGE_KEY = "library-search:last-search";
const SEARCH_EXPIRY_MS = 2 * 60 * 60 * 1000;

interface PersistedSearch {
  query: string;
  intent: string;
  books: BookSearchHit[];
  expiresAt: number;
}

export default function SearchPage() {
  const [books, setBooks] = useState<BookSearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultQuery, setResultQuery] = useState("");
  const [searchIntent, setSearchIntent] = useState("GENERAL_SEARCH");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(SEARCH_STORAGE_KEY);
    if (!savedSearch) return;

    try {
      const parsed: PersistedSearch = JSON.parse(savedSearch);
      if (
        typeof parsed.query !== "string" ||
        typeof parsed.intent !== "string" ||
        !Array.isArray(parsed.books) ||
        typeof parsed.expiresAt !== "number" ||
        parsed.expiresAt <= Date.now()
      ) {
        sessionStorage.removeItem(SEARCH_STORAGE_KEY);
        return;
      }

      setBooks(parsed.books);
      setResultQuery(parsed.query);
      setSearchIntent(parsed.intent);
      setHasSearched(true);
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
      return;
    }

    setIsLoading(true);
    setError("");
    setResultQuery(normalizedQuery);
    setSearchIntent(intent);
    setHasSearched(true);
    sessionStorage.removeItem(SEARCH_STORAGE_KEY);

    try {
      const response = await searchBooks(normalizedQuery, intent);
      const nextBooks = response.books;
      setBooks(nextBooks);
      const persistedSearch: PersistedSearch = {
        query: normalizedQuery,
        intent,
        books: nextBooks,
        expiresAt: Date.now() + SEARCH_EXPIRY_MS,
      };
      sessionStorage.setItem(
        SEARCH_STORAGE_KEY,
        JSON.stringify(persistedSearch),
      );
    } catch (searchError) {
      setBooks([]);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Book search failed.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavbar />
      <main className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
        {!hasSearched ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-5xl flex-col items-center justify-center pb-8 text-center -translate-y-10"
          >
            {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Your next great read is waiting
            </div> */}
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find a book that
              <span className="block font-serif italic text-primary">
                feels made for you.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Search across titles, authors, genres, and more to discover your
              next favorite.
            </p>
            <div className="mt-9 w-full">
              <SearchBar
                key={`${resultQuery}:${searchIntent}`}
                onSearch={handleSearch}
                initialQuery={resultQuery}
                initialIntent={searchIntent}
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
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
            <div className="mt-12 flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              Start with any book, topic, or author
            </div>
          </motion.section>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              layout: { duration: 0.45, ease: "easeInOut" },
            }}
            className="mx-auto max-w-5xl pt-2 sm:pt-4"
          >
            <SearchBar
              key={`${resultQuery}:${searchIntent}`}
              onSearch={handleSearch}
              initialQuery={resultQuery}
              initialIntent={searchIntent}
            />
            {hasSearched && (
              <section className="mt-8 space-y-5" aria-label="Search results">
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
                />
              </section>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
