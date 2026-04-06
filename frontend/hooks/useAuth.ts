/**
 * useAuth Hook
 * Manages authentication state and token
 */

"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/redux/store"
import { setUser, logout } from "@/redux/slice/auth.slice"
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
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  )

  // Initialize auth state on mount
  useEffect(() => {
    const storedToken = getTokenFromStorage()
    if (storedToken) {
      try {
        const decoded = decodeToken(storedToken)
        dispatch(setUser(decoded))
      } catch (error) {
        console.error("Failed to decode token:", error)
        removeTokenFromStorage()
        dispatch(logout())
      }
    }
  }, [dispatch])

  const setTokenAndPersist = (newToken: string, persistent: boolean = true) => {
    saveTokenToStorage(newToken, persistent)
    try {
      const decoded = decodeToken(newToken)
      dispatch(setUser(decoded))
    } catch (error) {
      console.error("Failed to decode token:", error)
    }
  }

  const clearAuth = () => {
    removeTokenFromStorage()
    dispatch(logout())
  }

  return {
    token: getTokenFromStorage(),
    isAuthenticated,
    decodedToken: user,
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
