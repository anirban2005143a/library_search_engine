/**
 * Authentication API calls
 */

import { apiCall, ApiResponse } from "./client"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
  }
  tokens: {
    accessToken: string
  }
}

export interface User {
  id: string
  email: string
  firstName?: string
  role?: "ROOT_ADMIN" | "ADMIN" | "READER"
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log(credentials)
  const response = await apiCall<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    requireAuth: false, // Login doesn't require auth
  })
  return response.data
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await apiCall("/auth/logout", {
    method: "POST",
  })
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<{ accessToken: string }> {
  const response = await apiCall<{ accessToken: string }>("/auth/refresh", {
    method: "POST",
  })
  return response.data
}