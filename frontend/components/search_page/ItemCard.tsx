"use client";

import React, { memo } from "react";
import {
  Calendar,
  Globe,
  Hash,
  Building2,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { MetadataItemProps } from "./types";
import { parseBookCategories, type BookSearchHit } from "@/utils/books.utils";

const hasValue = (value: string | number | null | undefined): value is string | number =>
  value !== null && value !== undefined && value !== "";

/* --- Metadata Item Component --- */
const MetadataItem: React.FC<MetadataItemProps> = ({
  label,
  value,
  icon,
  truncate = false,
  monospace = false,
}) => {
  if (!hasValue(value)) return null;

  return <div>
    <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
        </div>
    <p
      className={`text-sm text-foreground ${
        truncate ? "truncate" : ""
      } ${monospace ? "font-mono text-xs" : ""}`}
    >
      {value}
    </p>
  </div>;
};

/* --- ItemCard Component --- */
const ItemCard = memo(function ItemCard({ book }: { book: BookSearchHit }) {
  const source = book._source;
  const categories = parseBookCategories(source.categories);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-lg sm:flex-row"
    >
      <div className="flex shrink-0 items-center justify-center bg-muted/60 p-5 sm:w-48 sm:p-6">
        <div className="relative w-32 overflow-hidden rounded-lg shadow-md ring-1 ring-black/10 sm:w-full">
          {source.thumbnail ? (
            <img
              src={source.thumbnail}
              alt={source.title ? `Cover of ${source.title}` : "Book cover"}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 via-secondary to-muted px-4 text-center">
              <BookOpen className="h-9 w-9 text-primary/70" aria-hidden="true" />
              <span className="line-clamp-3 text-sm font-semibold text-foreground/80">
                {source.title || "Book"}
              </span>
            </div>
          )}
          </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
            {source.title || "Untitled book"}
          </h2>
          {hasValue(source.author) && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              by <span className="font-medium text-foreground/80">{source.author}</span>
            </p>
          )}
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.toLowerCase()}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {hasValue(source.description) && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {source.description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border/70 pt-4 sm:grid-cols-3">
          <MetadataItem
            label="Published"
            value={source.published_year}
            icon={<Calendar size={14} aria-hidden="true" />}
          />
          <MetadataItem
            label="Publisher"
            value={source.publisher}
            icon={<Building2 size={14} aria-hidden="true" />}
            truncate
          />
          <MetadataItem
            label="Language"
            value={source.language}
            icon={<Globe size={14} aria-hidden="true" />}
          />
          <MetadataItem
            label="Pages"
            value={source.pages}
            icon={<BookOpen size={14} aria-hidden="true" />}
          />
          <MetadataItem
            label="ISBN"
            value={source.isbn}
            icon={<Hash size={14} aria-hidden="true" />}
            monospace
          />
          <MetadataItem
            label="Catalog ID"
            value={source.id}
            icon={<Hash size={14} aria-hidden="true" />}
            monospace
          />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <span className="text-xs text-muted-foreground">Complete catalog record</span>
          <div className="flex flex-wrap items-center gap-2">
            {hasValue(source.link) && (
              <a
                href={source.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Read online
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            <Link
              href={`/book/${encodeURIComponent(book._id)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              View details
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export default ItemCard;