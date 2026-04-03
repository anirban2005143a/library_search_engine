"use client";

import {
  Star,
  Calendar,
  Globe,
  Hash,
  User,
  Building2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

const ItemCard = ({ book }) => {
  return (
    <article className="group flex flex-col overflow-hidden border-b border-border bg-background transition-colors hover:bg-muted/30 sm:flex-row sm:gap-8 sm:py-6 sm:px-4">
      {/* Book Cover - Fixed aspect ratio for a library catalog look */}
      <div className="relative mx-auto mt-4 w-32 shrink-0 sm:mx-0 sm:mt-0 sm:w-36">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="aspect-[2/3] w-full object-cover shadow-sm ring-1 ring-border"
        />
        {book.documentType === "E-Book" && (
          <div className="absolute top-0 right-0 bg-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-background">
            Digital
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col p-5 sm:p-0">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
              {book.title}
            </h2>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={14} />
              <span className="font-medium hover:text-primary cursor-pointer">
                {book.author}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 border border-border px-2 py-0.5 text-xs font-semibold">
            <Star size={13} className="fill-foreground text-foreground" />
            {book.rating.toFixed(1)}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-5 grid md:grid-cols-4 grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Meta label="Published" icon={<Calendar size={13} />}>
            {book.publishedYear}
          </Meta>

          <Meta label="Publisher" icon={<Building2 size={13} />}>
            <span className="truncate">{book.publisher}</span>
          </Meta>

          <Meta label="Language" icon={<Globe size={13} />}>
            {book.language}
          </Meta>

          <Meta label="Reference" icon={<Hash size={13} />}>
            <span className="font-mono text-xs whitespace-normal">
              {book.isbn}
            </span>
          </Meta>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tags */}
          <div className="flex flex-col  gap-3">
            <div className="border border-border px-2 py-0.5 text-[12px] font-semibold ">
              {book.readingLevel}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {book.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="hover:text-foreground cursor-default"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Action */}
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 1.0 }}
            className="flex items-center gap-1 text-xs font-semibold text-primary cursor-pointer "
          >
            Details <ExternalLink size={12} />
          </motion.button>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;


/* Meta Component */
const Meta = ({ icon, label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5 font-medium">
      {icon}
      {children}
    </div>
  </div>
);

