/**
 * useAuth Hook
 * Manages authentication state and token
 */

"use client"

import { useEffect, useState } from "react"
import {
  getTokenFromStorage,
  saveTokenToStorage,
  removeTokenFromStorage,
  hasToken,
} from "@/lib/api/client"

interface DecodedToken {
  id: string
  firstName: string
  email: string
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
  iat?: number
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const storedToken = getTokenFromStorage()
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
      try {
        const decoded = decodeToken(storedToken)
        setDecodedToken(decoded)
      } catch (error) {
        console.error("Failed to decode token:", error)
        removeTokenFromStorage()
        setIsAuthenticated(false)
      }
    }
    setIsLoading(false)
  }, [])

  const setTokenAndPersist = (newToken: string, persistent: boolean = true) => {
    setToken(newToken)
    setIsAuthenticated(true)
    saveTokenToStorage(newToken, persistent)
    try {
      const decoded = decodeToken(newToken)
      setDecodedToken(decoded)
    } catch (error) {
      console.error("Failed to decode token:", error)
    }
  }

  const clearAuth = () => {
    setToken(null)
    setIsAuthenticated(false)
    setDecodedToken(null)
    removeTokenFromStorage()
  }

  return {
    token,
    isAuthenticated,
    decodedToken,
    isLoading,
    setToken: setTokenAndPersist,
    clearAuth,
    hasToken: hasToken(),
  }
}

/**
 * Decode JWT token (basic decoding, not verification)
 * Only use this for client-side information - always verify on backend
 */
function decodeToken(token: string): DecodedToken {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid token format")
    }

    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    )

    return decoded as DecodedToken
  } catch (error) {
    throw new Error("Failed to decode token")
  }
}
