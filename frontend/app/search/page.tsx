"use client";

import { motion } from "framer-motion";
import SearchBar from "@/component/search_page/SearchBar";
import ShowBooks from "@/component/search_page/ShowBooks";
import Pagination from "@/component/search_page/Pagination";
import Header from "@/component/search_page/Header";

export default function SearchPage() {
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
        <Header />

        {/* Search Bar */}
        <SearchBar />

        <Pagination />

        {/* Main Content Area */}
        <div className="relative lg:flex gap-5 block">
          {/* Sidebar in flex for large screens */}
          {/* <SideBarFilters
            position="left"
            className={"hidden lg:flex"}
            filters={filters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            sideExpanded={leftExpanded}
          /> */}

          {/* Results Section */}
          <ShowBooks />
        </div>
      </motion.div>
    </main>
  );
}
