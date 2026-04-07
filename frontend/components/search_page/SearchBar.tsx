"use client";

import React, { useState, useCallback, memo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import {
  setBooks,
  setErrorMessage,
  setIntent,
  setIsLoading,
  setResultQuery,
  setResultType,
  setSearchID,
  setSearchQuery,
  setSearchType,
  setTotalBooks,
} from "@/redux/slice/books.slice";
import {  searchBooks } from "@/utils/books.utils";
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


const SearchBar: React.FC = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();  

  const searchType = useSelector((state:RootState)=> state.catalogue.searchType)
  const search_query = useSelector((state:RootState) => state.catalogue.search_query)
  const pageNo = useSelector((state:RootState) => state.catalogue.page_no)
  const search_id = useSelector((state:RootState) => state.catalogue.search_id)
  const intent = useSelector((state:RootState) => state.catalogue.intent)
  const result_query = useSelector((state:RootState) => state.catalogue.result_query)
  const result_type = useSelector((state:RootState)=> state.catalogue.result_type)

  const handleSearchTypeSelect = useCallback(
    (option: SearchOption) => {
      setIsDropdownOpen(false);
      dispatch(setIntent({ intent: option.value }));
      dispatch(setSearchType({ searchType: option.label }));
    },
    [dispatch]
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchQuery({ search_query: e.target.value }));
    },
    [dispatch]
  );

  const handleClearQuery = useCallback(() => {
    dispatch(setSearchQuery({ search_query: "" }));
    dispatch(setSearchQuery({ search_query: "" }));
  }, [dispatch]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleSearchBooks = useCallback(
    async () => {
      console.log("start searching")

      if(!search_query){
        dispatch(setErrorMessage({error_message : "Please provide a query"}))
        return 
      }

      console.log(search_query, search_id, pageNo, intent)

      dispatch(setIsLoading({isLoading : true}))

      
      const {searchId , books , totalBooks , error} = await searchBooks(search_query , search_id , pageNo , intent)
      
      dispatch(setIsLoading({isLoading : false}))
      dispatch(setBooks({books : books}))
      dispatch(setSearchID({search_id : searchId}))
      dispatch(setTotalBooks({totalBooks : totalBooks}))
      dispatch(setResultQuery({result_query : search_query}))
      dispatch(setResultType({result_type : searchType}))
      
    },
    [dispatch, search_query, search_id, pageNo, intent , searchType],
  )

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  document.addEventListener("pointerdown", handleClickOutside);

  return () => {
    document.removeEventListener("pointerdown", handleClickOutside);
  };
}, []);

  console.log(result_query , result_type)

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
          <div className="relative" ref={dropdownRef}>
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
              value={search_query}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchBooks();
                }
              }}
              onChange={handleQueryChange}
              placeholder={`Search by ${searchType.toLowerCase()}...`}
              className="flex-1 bg-transparent px-0 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              style={{ color: "var(--foreground)" }}
              aria-label="Search input"
            />

            {/* Clear button */}
            {search_query && (
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
              className="rounded-md transition-all px-2 py-2.5 hover:bg-muted duration-200 "
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