"use client"

import { motion } from "framer-motion"
import SearchBar from "./search_page/SearchBar"
import ShowBooks from "./search_page/ShowBooks"
import Pagination from "./search_page/Pagination"
import Header from "./search_page/Header"

export default function SearchPage() {
  return (
    <main
      className="min-h-screen px-4 py-6 md:px-6 lg:px-8"
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

<div className="mt-4">

        <Pagination />
</div>

        {/* Main Content Area */}
        <div className="relative block gap-5 lg:flex">
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
  )
}
