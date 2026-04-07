"use client"

import { LogOut, MoreHorizontal, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface ExpandedGridProps {
  user: {
    name: string
    email: string
    role: "ROOT_ADMIN" | "ADMIN" | "READER"
  }
}

// Extracted so we can reuse it in both the accordion and the popover!
export const ExpandedGrid = ({ user }: ExpandedGridProps) => {
  const { clearAuth } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    // Refresh the page to reset all state and return to home
    window.location.href = "/"
  }

  const ROLE_COLOR_MAP: Record<string, string> = {
    READER: "bg-muted text-green-500",
    ADMIN: "bg-muted text-sky-500",
    ROOT_ADMIN: "bg-muted text-purple-500",
  }
  const roleColor = ROLE_COLOR_MAP[user.role] || ROLE_COLOR_MAP.READER

  return (
    <div className="grid grid-cols-2 gap-2 pt-1 pb-3">
      <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/50 py-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
        <User className="h-4 w-4" />
        Profile
      </button>

      <button
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/50 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent ${roleColor}`}
      >
        {user.role}
      </button>

      <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/50 py-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
        <MoreHorizontal className="h-4 w-4" />
        Placeholder
      </button>

      <button
        onClick={handleLogout}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/50 py-3 text-sm text-destructive transition-colors hover:bg-sidebar-accent hover:text-destructive/80"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}
