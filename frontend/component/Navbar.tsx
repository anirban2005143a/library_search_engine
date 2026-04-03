"use client"
import { useCurrentPage } from "@/lib/use-current-page"

import { ModeToggle } from "./DarkModeToggle"

const Navbar = () => {
  const currentPage = useCurrentPage()
  return (
    <nav className="flex items-center justify-between p-2">
      {/* left */}
      <h1 className="text-lg font-semibold text-foreground">
        {currentPage ? currentPage.title : "Overview"}
      </h1>
      {/* right */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        {/*Theme change*/}
      </div>
    </nav>
  )
}

export default Navbar
