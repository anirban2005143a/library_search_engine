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

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    headers: customHeaders = {},
    ...otherOptions
  } = options

  const headers = new Headers(customHeaders)

  // Set default content type if not already set and body is not FormData
  if (
    !headers.has("Content-Type") &&
    otherOptions.body &&
    !(otherOptions.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json")
  }

  // Add authentication token if required
  if (requireAuth) {
    const token = getTokenFromStorage()
    if (!token) {
      throw new ApiError(401, null, "No authentication token found")
    }
    headers.set("Authorization", `Bearer ${token}`)
  }

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...otherOptions,
      headers,
    })

    const contentType = response.headers.get("content-type")
    let data: any

    if (contentType?.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data,
        data?.error || data?.message || `HTTP ${response.status}`
      )
    }

    return data as ApiResponse<T>
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      500,
      null,
      error instanceof Error ? error.message : "Unknown error"
    )
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
 * Save token to localStorage
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
}

/**
 * Remove token from storage
 */
export function removeTokenFromStorage(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

/**
 * Check if token exists in storage
 */
export function hasToken(): boolean {
  return getTokenFromStorage() !== null
}
