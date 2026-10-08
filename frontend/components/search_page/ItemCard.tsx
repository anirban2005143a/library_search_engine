"use client";

import React, { memo } from "react";
import {
  Calendar,
  Globe,
  Hash,
  Building2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { MetadataItemProps } from "./types";
import { useRouter } from "next/navigation";
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
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p
      className={`text-sm text-foreground/90 ${
        truncate ? "truncate" : ""
      } ${monospace ? "font-mono text-xs" : ""}`}
    >
      {value}
    </p>
  </div>;
};

/* --- ItemCard Component --- */
const ItemCard = memo(function ItemCard({ book }: { book: BookSearchHit }) {
  const router = useRouter();
  const source = book._source;
  const rating = hasValue(source.average_rating) ? Number(source.average_rating) : null;
  const categories = parseBookCategories(source.categories);

  return (
    <motion.article
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden border-b border-border bg-background transition-colors hover:bg-muted/30 sm:flex-row sm:p-6"
    >
      {/* Book Cover */}
      <div className="relative mx-auto mt-4 w-32 md:w-[200px] shrink-0 sm:mx-0 sm:mt-0 sm:w-36">
        <img
          src={source.thumbnail || "/dummy_cover_image.png"}
          alt={source.title || "Book cover"}
          loading="lazy"
          className="aspect-4/5 w-full object-cover shadow-sm ring-1 ring-border"
        />
        {source.type?.toLowerCase() === "e-book" && (
          <div className="absolute top-0 right-0 bg-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-background">
            Digital
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-0 sm:pl-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
              {source.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-muted-foreground">by</span>
              <button className="text-sm text-foreground/80 hover:text-primary font-medium transition-colors">
                {source.author}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasValue(source.reading_level) && (
              <span className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded">
                {source.reading_level}
              </span>
            )}
            {rating !== null && Number.isFinite(rating) && (
              <span className="text-sm font-semibold text-foreground">
                {rating.toFixed(1)} / 5
              </span>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <MetadataItem
            label="Published"
            value={source.published_year}
            icon={<Calendar size={12} />}
          />
          <MetadataItem
            label="Publisher"
            value={source.publisher}
            icon={<Building2 size={12} />}
            truncate
          />
          <MetadataItem
            label="Language"
            value={source.language}
            icon={<Globe size={12} />}
          />
          <MetadataItem
            label="ISBN"
            value={source.isbn}
            icon={<Hash size={12} />}
            monospace
          />
        </div>

        {/* Categories Section */}
        {categories.length > 0 && <div className="mt-10 flex flex-wrap items-start gap-x-3 gap-y-2 w-8/10">
          <div className="flex items-center gap-1.5">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Categories:</span>
          </div>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {categories.map((category, index) => (
              <span
                key={index}
                className="text-xs text-foreground/70 hover:text-foreground transition-colors"
              >
                {category}
              </span>
            ))}
          </div>
        </div>}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-border text-end">
          <button 
          onClick={(e)=>{
            e.preventDefault()
            router.push(`/book/${book._id}`)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
            <span>View Details</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export default ItemCard;