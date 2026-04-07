"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, User } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ExpandedGrid } from "./ExpandedGrid"
import { Avatar } from "./ui/avatar"
import { AvatarFallback, AvatarImage } from "./ui/avatar"

export function SidebarProfile() {
  const [isOpen, setIsOpen] = useState(false)
  const { decodedToken } = useAuth()
  const { state } = useSidebar()
  const isMobileDevice = useIsMobile()

  // Refs for tracking timers
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isCollapsed = state === "collapsed"

  // Role-based profile picture mapping
  const PROFILE_IMAGE_MAP: Record<string, string> = {
    ROOT_ADMIN: "https://avatars.githubusercontent.com/u/153212817",
    ADMIN: "https://avatars.githubusercontent.com/u/108313943",
    READER: "https://avatars.githubusercontent.com/u/47986470",
  }

  const user = {
    name: decodedToken?.firstName || "Guest",
    email: decodedToken?.email || "Not logged in",
    role: decodedToken?.role || "READER",
  }

  const profileImage = PROFILE_IMAGE_MAP[user.role] || PROFILE_IMAGE_MAP.READER

  // Handle auto-close after 10 seconds and reset after 8 seconds of inactivity
  useEffect(() => {
    if (!isOpen) {
      // Clear timers when closing
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      return
    }

    // Set auto-close timer (10 seconds)
    autoCloseTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 10000)

    // Set inactivity timer (8 seconds) - will reset on activity
    const setupInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 8000)
    }

    setupInactivityTimer()

    // Track activity with debouncing
    const handleActivity = () => {
      setupInactivityTimer()
    }

    // Use event delegation for efficiency - listen on the parent container
    const container = document.querySelector("[data-sidebar-profile-container]")
    if (container) {
      container.addEventListener("mousemove", handleActivity)
      container.addEventListener("click", handleActivity)
      container.addEventListener("touchstart", handleActivity)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleActivity)
        container.removeEventListener("click", handleActivity)
        container.removeEventListener("touchstart", handleActivity)
      }
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [isOpen])

  // --- CONDITION 1: COLLAPSED SIDEBAR OR MOBILE DEVICE ---
  if (isCollapsed || isMobileDevice) {
    return (
      <div className="mt-auto flex w-full items-center justify-center p-2">
        <Popover>
          {/* We just show the avatar with no outline or border */}
          <PopoverTrigger asChild>
            <div className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sidebar-accent transition-transform hover:scale-105">
              <Avatar className="h-10 w-10 rounded-full border-2 border-white">
                <AvatarImage src={profileImage} />
                <AvatarFallback>
                  <User className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>

          {/* This content pops out of the side of the collapsed rail */}
          <PopoverContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-64 overflow-hidden rounded-2xl border-sidebar-border bg-sidebar p-0 shadow-2xl"
          >
            {/* Minimal top section for the popover */}
            <div className="flex h-16 items-center gap-3 border-b border-sidebar-border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm leading-none font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
            <div className="px-2">
              <ExpandedGrid user={user} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // --- CONDITION 2: SIDEBAR IS EXPANDED AND NOT MOBILE ---
  return (
    <div className="mt-auto w-full p-2" data-sidebar-profile-container>
      <motion.div
        layout
        className="flex w-full cursor-pointer flex-col overflow-hidden border border-sidebar-border bg-sidebar-primary-foreground text-sidebar-foreground shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        initial={false}
        animate={{
          borderRadius: isOpen ? "24px" : "32px",
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        {/* Top Section */}
        <motion.div
          layout="position"
          className="flex h-16 shrink-0 items-center justify-between p-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent">
              <Avatar className="h-12 w-12 rounded-full border-2 border-white">
                <AvatarImage src={profileImage} />
                <AvatarFallback>
                  <User className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm leading-none font-medium">
                {user.name}
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <div className="mr-1 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-sidebar-accent">
            <motion.div
              animate={{ rotate: isOpen ? 360 : 0 }}
              transition={{ type: "spring", bounce: 0, duration: 1.0 }}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Expanded Section */}
        <AnimatePresence initial={false}>
          {isOpen && decodedToken && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className="px-3"
            >
              <ExpandedGrid user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
