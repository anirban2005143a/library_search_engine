"use client"
import { useCurrentPage } from "@/lib/use-current-page"
import { useSidebar } from "@/component/ui/sidebar"
import { Menu } from "lucide-react"
import { ModeToggle } from "./DarkModeToggle"

const Navbar = () => {
  const currentPage = useCurrentPage()
  const { toggleSidebar } = useSidebar()

  return (
    <nav className="flex items-center justify-between p-2">
      {/* left - sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="rounded-md p-2 transition-colors hover:bg-accent md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* center - page title */}
      <div className="flex-1 text-center md:flex-none md:text-left">
        <h1 className="text-lg font-semibold text-foreground">
          {currentPage ? currentPage.title : "Log In"}
        </h1>
      </div>

      {/* right - dark mode toggle */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        {/*Theme change*/}
      </div>
    </nav>
  )
}

export default Navbar
