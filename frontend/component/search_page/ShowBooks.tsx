"use client"

import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // adjust path to your store
import ItemCard from "./ItemCard";
import { Book } from "./types"; // adjust path to your Book type

const ShowBooks: React.FC = () => {
  const books = useSelector((state: RootState) => state.catalogue.books );
  
  // These are referenced in your JSX but not defined in your snippet.
  // You may already have them in your parent component or Redux state.
  const query: string = ""; // replace with actual query state if needed
  const activeFiltersCount: number = 0; // replace with actual count
  const clearAll = () => {
    // implement clear logic
  };

  return (
    <>
      <section className="flex-1 space-y-6 min-w-0">
        {/* Results Grid */}
        <AnimatePresence mode="wait">
          {books.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-12 text-center"
            >
              <XCircle
                size={48}
                className="mx-auto mb-4 text-muted-foreground/50"
              />
              <h3 className="text-base font-semibold text-foreground mb-1">
                No results found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
              {(query || activeFiltersCount > 0) && (
                <button
                  onClick={clearAll}
                  className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {books.map((book:any, index:number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.2),
                    }}
                  >
                    <ItemCard book={book} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default ShowBooks;