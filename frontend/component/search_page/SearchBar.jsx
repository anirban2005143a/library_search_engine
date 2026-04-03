"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

const SearchBar = ({ query, onQueryChange }) => {
  return (
    <motion.div
      // initial={{ opacity: 0, y: -12 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.3 }}
      className="flex items-center gap-3 rounded-lg border px-4 py-2.5 w-4/5 mx-auto transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <Search size={18} className="text-muted-foreground" />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by title, author, category, ISBN..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        style={{ color: "var(--foreground)" }}
      />
    </motion.div>
  );
};

export default SearchBar;