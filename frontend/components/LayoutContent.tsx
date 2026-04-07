"use client"

import { useAuth } from "@/hooks/useAuth"
import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface LayoutContentProps {
  children: React.ReactNode
  defaultOpen: boolean
}

export function LayoutContent({ children, defaultOpen }: LayoutContentProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <main className="w-full flex-col">
          <Navbar />
          <DropdownMenuSeparator />
          <div className="flex min-h-screen items-center justify-center px-2">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </main>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={isAuthenticated ? defaultOpen : false}>
      {isAuthenticated && <AppSidebar />}
      <main className="w-full flex-col">
        <Navbar />
        <DropdownMenuSeparator />
        <div className="px-2">{children}</div>
      </main>
    </SidebarProvider>
  )
}
