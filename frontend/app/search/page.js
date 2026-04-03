"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, BookOpen, Filter } from "lucide-react";
import SearchBar from "@/component/search_page/SearchBar";
import SideBarFilters from "@/component/search_page/Side_bar_fiilters";
import ItemCard from "@/component/search_page/ItemCard";
import { demoBooks, addFilterValue, removeFilterValue, applyFilters } from "@/component/search_page/searchHelpers";

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
  const [rightExpanded, setRightExpanded] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredBooks = useMemo(() => applyFilters(demoBooks, filters, query), [filters, query]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredBooks.length / pageSize)), [filteredBooks.length]);
  const paginatedBooks = useMemo(
    () => filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredBooks, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    console.log("pageChanged", page);
    // Placeholder for any callback to server/analytics when page clicked
    // e.g., fetchPageResults(page);
  };

  const handleAddFilter = (key, value) => {
    if (!value || !value.trim()) return;
    setFilters((prev) => addFilterValue(prev, key, value));
  };

  const handleRemoveFilter = (key, value) => {
    setFilters((prev) => removeFilterValue(prev, key, value));
  };

  const clearAll = () => {
    setFilters({ author: [], genre: [], isbn: [], format: [], documentType: [], readingLevel: [] });
    setQuery("");
  };

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);
  }, [filters]);

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
          
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <div 
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                }}
              >
                {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-all hover:shadow-md"
              style={{ 
                borderColor: "var(--border)", 
                background: "var(--card)", 
                color: "var(--foreground)" 
              }}
              onClick={clearAll}
            >
              Clear all
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar query={query} onQueryChange={setQuery} />

        {/* Main Content Area */}
        <div className="flex gap-5">
          {/* Left Sidebar */}
          <SideBarFilters
            position="left"
            filters={filters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            sideExpanded={leftExpanded}
            onToggleExpand={() => setLeftExpanded((pv) => !pv)}
          />

          {/* Results Section */}
          <section className="flex-1 space-y-4 min-w-0">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border px-4 py-3"
              style={{ 
                borderColor: "var(--border)", 
                background: "var(--card)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Showing <strong className="text-foreground">{filteredBooks.length}</strong> of{" "}
                  <strong>{demoBooks.length}</strong> books
                  {query && (
                    <span>
                      {" "}matching <strong className="text-foreground">"{query}"</strong>
                    </span>
                  )}
                </p>
                
                {filteredBooks.length > 0 && (
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {filteredBooks.length === 1 ? "1 result" : `${filteredBooks.length} results`}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Results Grid */}
            <AnimatePresence >
              {filteredBooks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg border p-12 text-center"
                  style={{ 
                    borderColor: "var(--border)", 
                    background: "var(--card)",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <XCircle size={48} className="mx-auto mb-4 opacity-50" style={{ color: "var(--muted-foreground)" }} />
                  <h3 className="text-lg font-semibold mb-2">No matching books found</h3>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  {(query || activeFiltersCount > 0) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearAll}
                      className="mt-4 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      Clear all filters
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-5 grid-cols-1 "
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                      >
                        <ItemCard book={book} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {filteredBooks.length > pageSize && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3">
                <button
                  className="rounded px-3 py-1 text-sm font-medium transition hover:bg-muted"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`rounded px-3 py-1 text-sm font-medium transition ${
                      page === currentPage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="rounded px-3 py-1 text-sm font-medium transition hover:bg-muted"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
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