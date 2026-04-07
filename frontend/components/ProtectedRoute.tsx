"use client"

import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/lib/navigation"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { decodedToken, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !decodedToken) {
      router.push("/")
      return
    }

    if (!allowedRoles.includes(decodedToken.role)) {
      // User doesn't have permission for this page
      router.push("/")
      return
    }
  }, [isAuthenticated, decodedToken, isLoading, allowedRoles, router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !decodedToken) {
    return null
  }

  if (!allowedRoles.includes(decodedToken.role)) {
    return null
  }

  return <>{children}</>
}
