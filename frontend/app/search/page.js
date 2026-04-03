"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, BookOpen, Filter } from "lucide-react";
import SearchBar from "@/component/search_page/SearchBar";
import SideBarFilters from "@/component/search_page/Side_bar_fiilters";
import ItemCard from "@/component/search_page/ItemCard";
import {
  demoBooks,
  addFilterValue,
  removeFilterValue,
  applyFilters,
} from "@/component/search_page/searchHelpers";
import React from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    author: [],
    genre: [],
    isbn: [],
    format: [],
    documentType: [],
    readingLevel: [],
  });
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const sidebarPopup = useRef(null);
  const filterButton = useRef(null);

  const pageSize = 8;
  const totalBooks = 500;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalBooks / pageSize)),
    [totalBooks, pageSize],
  );

  const onPageChange = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarPopup.current &&
        !sidebarPopup.current.contains(event.target) &&
        filterButton.current &&
        !filterButton.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

  const handleAddFilter = (key, value) => {
    if (!value || !value.trim()) return;
    setFilters((prev) => addFilterValue(prev, key, value));
  };

  const handleRemoveFilter = (key, value) => {
    setFilters((prev) => removeFilterValue(prev, key, value));
  };

  const clearAll = () => {
    setFilters({
      author: [],
      genre: [],
      isbn: [],
      format: [],
      documentType: [],
      readingLevel: [],
    });
    setQuery("");
  };

  return (
    <main
      className="min-h-screen py-6 px-4 md:px-6 lg:px-8"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-6xl space-y-5"
      >
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-primary" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Library Search
            </h1>
          </div>

          <div className="flex items-center gap-3 w-auto">
            {/* {activeFiltersCount > 0 && (
              <div
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                }}
              >
                {activeFiltersCount} active filter
                {activeFiltersCount !== 1 ? "s" : ""}
              </div>
            )} */}

            <motion.button
              ref={filterButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-all whitespace-nowrap hover:shadow-md lg:hidden flex items-center gap-2"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Filter size={16} />
              <span> Filters</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-all hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
              onClick={clearAll}
            >
              Clear all
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar query={query} onQueryChange={setQuery} />

        {/* Sidebar popup for  */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              ref={sidebarPopup}
              initial={{ x: -350 }}
              animate={{ x: 0 }}
              exit={{ x: -350 }}
              transition={{ duration: 0.3 }}
              className=" fixed top-0 left-0 h-full z-50"
            >
              <SideBarFilters
                className={
                  "lg:hidden block w-[40%] sm:min-w-[350px] min-w-screen"
                }
                position="left"
                filters={filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                sideExpanded={true}
                onToggleExpand={() => setSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="relative lg:flex gap-5 block">
          {/* Sidebar in flex for small screens */}
          <SideBarFilters
            position="left"
            className={"hidden lg:flex"}
            filters={filters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            sideExpanded={leftExpanded}
          />

          {/* Results Section */}
          <section className="flex-1 space-y-6 min-w-0">
            {/* Results Header - Clean Design */}
            <div className="flex  flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 mt-4">
              {/* Results Info */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium text-foreground">
                  {totalBooks} {totalBooks === 1 ? "result" : "results"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalBooks)} of {totalBooks}{" "}
                  entries
                  {query && (
                    <span>
                      {" "}
                      matching{" "}
                      <span className="font-medium text-foreground">
                        "{query}"
                      </span>
                    </span>
                  )}
                </p>
              </div>

              {/* Page Info */}
              <div className="text-xs text-muted-foreground">
                Page{" "}
                <span className="font-semibold text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalPages}
                </span>
              </div>
            </div>

            {/* Pagination - All Pages Visible */}
            {/* Pagination with Ellipsis */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1 border-b  border-border pb-6">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      onPageChange(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-sm rounded-md border border-border bg-card text-foreground/70 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers with Ellipsis */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisible = 5; // Show max 5 pages
                    const sidePages = 2; // Pages on each side of current

                    if (totalPages <= maxVisible) {
                      // Show all pages
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);

                      // Calculate range around current page
                      let start = Math.max(2, currentPage - sidePages);
                      let end = Math.min(
                        totalPages - 1,
                        currentPage + sidePages,
                      );

                      // Add ellipsis after first page if needed
                      if (start > 2) {
                        pages.push("...");
                      }

                      // Add middle pages
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      // Add ellipsis before last page if needed
                      if (end < totalPages - 1) {
                        pages.push("...");
                      }

                      // Always show last page
                      pages.push(totalPages);
                    }

                    return pages.map((pageNum, index) => (
                      <React.Fragment key={index}>
                        {pageNum === "..." ? (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onPageChange(pageNum);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`min-w-[32px] h-8 px-2 text-sm rounded-md transition-all ${
                              currentPage === pageNum
                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                : "text-foreground/70 hover:bg-muted"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )}
                      </React.Fragment>
                    ));
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      onPageChange(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 text-sm rounded-md border border-border bg-card text-foreground/70 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Grid */}
            <AnimatePresence mode="wait">
              {demoBooks.length === 0 ? (
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
                    {demoBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
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

          {/* Right Sidebar - Optional, uncomment if needed */}
          {/* 
          <SideBarFilters
            position="right"
            filters={filters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            sideExpanded={rightExpanded}
            onToggleExpand={() => setRightExpanded((pv) => !pv)}
          />
          */}
        </div>
      </motion.div>
    </main>
  );
}
