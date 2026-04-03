"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import SideBarFilters from "./SidebarFiilters";
import { BookOpen, Filter } from "lucide-react";

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const sidebarPopup = useRef<HTMLDivElement | null>(null);
  const filterButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarPopup.current &&
        !sidebarPopup.current.contains(event.target as Node) &&
        filterButton.current &&
        !filterButton.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
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
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Clear all
          </motion.button>
        </div>
      </div>

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
              className="lg:hidden block w-[40%] sm:min-w-[350px] min-w-screen"
              position="left"
              sideExpanded={true}
              onToggleExpand={() => setSidebarOpen(false)}
              filters={{}} // <-- Add this line
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;