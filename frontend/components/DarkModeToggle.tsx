"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button variant="secondary" size="icon" onClick={toggleTheme} className="relative overflow-hidden">
      {/* Sun Icon */}
      <Sun 
        className={cn(
          "h-[1.2rem] w-[1.2rem] shrink-0",
          isDark ? "animate-spring-out absolute" : "animate-spring-in"
        )} 
      />
      
      {/* Moon Icon */}
      <Moon 
        className={cn(
          "h-[1.2rem] w-[1.2rem] shrink-0",
          isDark ? "animate-spring-in" : "animate-spring-out absolute"
        )} 
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
