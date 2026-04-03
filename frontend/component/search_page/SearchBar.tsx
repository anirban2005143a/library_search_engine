"use client";

import React, { useState, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import {
  setIntent,
  setSearchQuery,
  setSearchType,
} from "@/redux/slice/books.slice";
import { handleSearchBooks } from "@/utils/books.utils";
import { RootState } from "@/redux/store";

/* --- Types --- */
type SearchOption = {
  value: string;
  label: string;
};

const searchOptions: SearchOption[] = [
  { value: "GENERAL_SEARCH", label: "All Fields" },
  { value: "TITLE_SEARCH", label: "Title" },
  { value: "AUTHOR_SEARCH", label: "Author" },
  { value: "PUBLISHER_SEARCH", label: "Publisher" },
  { value: "GENRE_SEARCH", label: "Genre" },
  { value: "DESCRIPTION_SEARCH", label: "Description" },
  { value: "ISBN_SEARCH", label: "ISBN" },
];


/* --- Component --- */
const SearchBar: React.FC = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchType, setSearchTypeLocal] = useState<string>("All Fields");
  const [inputQuery, setInputQuery] = useState<string>("");

  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.catalogue.search_query);

  const handleSearchTypeSelect = useCallback(
    (option: SearchOption) => {
      setSearchTypeLocal(option.label);
      setIsDropdownOpen(false);
      dispatch(setIntent({ intent: option.value }));
      dispatch(setSearchType({ searchType: option.label }));
    },
    [dispatch]
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputQuery(e.target.value);
      dispatch(setSearchQuery({ search_query: e.target.value }));
    },
    [dispatch]
  );

  const handleClearQuery = useCallback(() => {
    setInputQuery("");
    dispatch(setSearchQuery({ search_query: "" }));
  }, [dispatch]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  return (
    <div className="container mb-0 mx-auto pt-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-4/5 mx-auto"
      >
        <div
          className="flex items-center gap-2 rounded-lg border transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Search Type Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-muted/50 rounded-l-lg"
              style={{ color: "var(--foreground)" }}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <Search size={16} className="text-muted-foreground" />
              <span className="hidden sm:inline">{searchType}</span>
              <span className="sm:hidden">{searchType.slice(0, 3)}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 top-full mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50"
                  style={{
                    background: "var(--popover)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="py-1">
                    {searchOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSearchTypeSelect(option)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 ${
                          searchType === option.label
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                        style={{
                          color:
                            searchType === option.label
                              ? "var(--primary)"
                              : "var(--popover-foreground)",
                        }}
                      >
                        {option.label}
                        {searchType === option.label && (
                          <span className="ml-2 text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2">
            <input
              value={inputQuery}
              onChange={handleQueryChange}
              placeholder={`Search by ${searchType.toLowerCase()}...`}
              className="flex-1 bg-transparent px-0 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              style={{ color: "var(--foreground)" }}
              aria-label="Search input"
            />

            {/* Clear button */}
            {inputQuery && (
              <button
                onClick={handleClearQuery}
                className="p-1 rounded-md transition-colors duration-200 hover:bg-muted"
                aria-label="Clear search"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Search icon */}
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSearchBooks();
              }}
              className="rounded-md transition-all px-2 py-2.5 hover:bg-muted duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Search"
            >
              <Search
                size={18}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;

/* --- Dropdown animation variants --- */
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" as const},
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.12 },
  },
};