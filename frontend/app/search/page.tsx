"use client";

import { motion } from "framer-motion";
import SearchBar from "@/components/search_page/SearchBar";
import ShowBooks from "@/components/search_page/ShowBooks";
import Pagination from "@/components/search_page/Pagination";
import Header from "@/components/search_page/Header";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { showToast } from "@/components/ShowToast";

export default function SearchPage() {
  const error_message = useSelector((state:RootState)=>state.catalogue.error_mesaage)

  useEffect(() => {
    if(error_message) showToast(error_message,1)
  }, [error_message])
  
  return (
    <>
    <ToastContainer/>
    <main
      className="min-h-screen py-6 px-4 md:px-6 lg:px-8 "
      // style={{ background: "var(--background)", color: "var(--foreground)" }}
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


        <div className=" mt-4">
            <Pagination />
        </div>

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
    </>
  );
}
