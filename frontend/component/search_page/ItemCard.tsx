"use client";

import React from "react";
import {
  Star,
  Calendar,
  Globe,
  Hash,
  Building2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import {  ItemCardProps, MetadataItemProps } from "./types";

/* --- Types --- */



/* --- Metadata Item Component --- */
const MetadataItem: React.FC<MetadataItemProps> = ({
  label,
  value,
  icon,
  truncate = false,
  monospace = false,
}) => (
  <div>
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
  </div>
);

/* --- ItemCard Component --- */
const ItemCard: React.FC<ItemCardProps> = ({ book }) => {
  return (
    <motion.article
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden border-b border-border bg-background transition-colors hover:bg-muted/30 sm:flex-row sm:p-6"
    >
      {/* Book Cover */}
      <div className="relative mx-auto mt-4 w-32 md:w-[200px] shrink-0 sm:mx-0 sm:mt-0 sm:w-36">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="aspect-4/5 w-full object-cover shadow-sm ring-1 ring-border"
        />
        {book.documentType === "E-Book" && (
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
              {book.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-muted-foreground">by</span>
              <button className="text-sm text-foreground/80 hover:text-primary font-medium transition-colors">
                {book.author}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reading Level */}
            <span className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded">
              {book.readingLevel}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-primary/80 text-primary/80" />
              <span className="text-sm font-semibold text-foreground">
                {book.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <MetadataItem
            label="Published"
            value={book.publishedYear}
            icon={<Calendar size={12} />}
          />
          <MetadataItem
            label="Publisher"
            value={book.publisher}
            icon={<Building2 size={12} />}
            truncate
          />
          <MetadataItem
            label="Language"
            value={book.language}
            icon={<Globe size={12} />}
          />
          <MetadataItem
            label="ISBN"
            value={book.isbn}
            icon={<Hash size={12} />}
            monospace
          />
        </div>

        {/* Categories Section */}
        <div className="mt-10 flex flex-wrap items-start gap-x-3 gap-y-2 w-8/10">
          <div className="flex items-center gap-1.5">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Categories:</span>
          </div>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {book.categories.map((category, index) => (
              <span
                key={index}
                className="text-xs text-foreground/70 hover:text-foreground transition-colors"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-border text-end">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
            <span>View Details</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ItemCard;