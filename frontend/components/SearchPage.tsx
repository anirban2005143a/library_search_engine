"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import SearchBar from "./search_page/SearchBar"
import ShowBooks from "./search_page/ShowBooks"
import Header from "./search_page/Header"
import { searchBooks, type BookSearchHit } from "@/utils/books.utils"

export default function SearchPage() {
  const [books, setBooks] = useState<BookSearchHit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resultQuery, setResultQuery] = useState("")

  const handleSearch = async (query: string, intent: string) => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      setBooks([])
      setError("Enter a title, author, or keyword to search.")
      setResultQuery("")
      return
    }

    setIsLoading(true)
    setError("")
    setResultQuery(normalizedQuery)

    try {
      const response = await searchBooks(normalizedQuery, intent)
      setBooks(response.books)
    } catch (searchError) {
      setBooks([])
      setError(searchError instanceof Error ? searchError.message : "Book search failed.")
    } finally {
      setIsLoading(false)
    }
  }

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
        <SearchBar onSearch={handleSearch} />
        {resultQuery && !isLoading && !error && (
          <p className="px-2 text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? "result" : "results"} for “{resultQuery}”
          </p>
        )}
        <div className="relative">
          <ShowBooks books={books} isLoading={isLoading} error={error} />
        </div>
      </motion.div>
    </main>
  )
}
