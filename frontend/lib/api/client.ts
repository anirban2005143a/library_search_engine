import axios, { AxiosError } from "axios"

/**
 * API Client Configuration
 * Handles base API calls with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export interface ApiResponse<T> {
  status?: string
  results?: number
  data: T
  error?: string
  message?: string
  pagination?: {
    total: number
    page: number
    pages: number
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    headers: customHeaders = {},
    ...otherOptions
  } = options

  const headers = {
    ...Object.fromEntries(new Headers(customHeaders) as any),
  }

  if (requireAuth) {
    const token = getTokenFromStorage()
    if (!token) {
      throw new ApiError(401, null, "No authentication token found")
    }
    headers["Authorization"] = `Bearer ${token}`
  }

  if (
    !headers["Content-Type"] &&
    (otherOptions as any).body &&
    !( (otherOptions as any).body instanceof FormData )
  ) {
    headers["Content-Type"] = "application/json"
  }

  try {
    const response = await apiClient.request<ApiResponse<T>>({
      url: endpoint,
      method: (otherOptions.method as any) || "GET",
      headers,
      data: (otherOptions as any).body,
    })

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<any>
      const status = axiosError.response?.status ?? 500
      const data = axiosError.response?.data
      const message =
        data?.error || data?.message || axiosError.message || "Request failed"
      throw new ApiError(status, data, message)
    }

    throw new ApiError(500, null, error instanceof Error ? error.message : "Unknown error")
  }
}

/**
 * Storage key for JWT token
 */
const TOKEN_KEY = "lms_jwt_token"

/**
 * Get token from storage (localStorage or sessionStorage)
 */
export function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Save token to localStorage and also set in cookie for middleware
 */
export function saveTokenToStorage(
  token: string,
  persistent: boolean = true
): void {
  if (typeof window === "undefined") return

  if (persistent) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
  }

  // Also set in cookie for middleware
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${persistent ? 86400 * 7 : ''}; samesite=strict`
}

/**
 * Remove token from storage
 */
export function removeTokenFromStorage(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  // Remove from cookie
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

/**
 * Check if token exists in storage
 */
export function hasToken(): boolean {
  return getTokenFromStorage() !== null
}
