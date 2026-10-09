"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Building2, CalendarDays } from "lucide-react";
import Link from "next/link";
import { parseBookCategories, type BookSearchHit } from "@/utils/books.utils";

const ItemCard = ({ book }: { book: BookSearchHit }) => {
  const source = book._source;
  const categories = parseBookCategories(source.categories).slice(0, 3);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md sm:flex-row"
    >
      <div className="flex shrink-0 items-center justify-center bg-muted/50 p-4 sm:w-36 sm:p-5">
        <div className="w-24 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/10 sm:w-full">
          {source.thumbnail ? (
            <img
              src={source.thumbnail}
              alt={source.title ? `Cover of ${source.title}` : "Book cover"}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-secondary to-muted p-3 text-center">
              <BookOpen className="h-7 w-7 text-primary/70" aria-hidden="true" />
              <span className="line-clamp-3 text-xs font-semibold text-foreground/80">
                {source.title || "Book"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {source.title || "Untitled book"}
          </h2>
          {source.author && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              by <span className="font-medium text-foreground/80">{source.author}</span>
            </p>
          )}
        </div>

        {(source.publisher || source.published_year) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {source.publisher && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Building2
                  className="h-4 w-4 shrink-0 text-primary/80"
                  aria-hidden="true"
                />
                <span className="truncate">{source.publisher}</span>
              </span>
            )}
            {source.published_year && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  className="h-4 w-4 shrink-0 text-primary/80"
                  aria-hidden="true"
                />
                {source.published_year}
              </span>
            )}
          </div>
        )}

        {categories.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Book categories">
            {categories.map((category) => (
              <li
                key={category.toLowerCase()}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {category}
              </li>
            ))}
          </ul>
        )}

        {source.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {source.description}
          </p>
        )}

        <div className="mt-auto flex justify-end pt-5">
          <Link
            href={`/book/${encodeURIComponent(book._id)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View details
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default ItemCard;
