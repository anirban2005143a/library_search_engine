/**
 * Users API Service
 * Handles all user-related API calls
 */

import { apiCall, ApiResponse } from "./client"

export interface User {
  id: string
  firstName: string
  lastName: string | null
  email: string
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
  createdAt: string
  createdBy: string | null
}

export interface RegisterUserPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
}

export interface UpdateUserRolePayload {
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
}

export interface ResetPasswordPayload {
  password: string
}

export interface BulkUserResponse {
  success: RegisterUserPayload[]
  errors: Array<{ email: string; message: string }>
}

/**
 * Fetch all users with pagination
 */
export async function getAllUsers(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<User[]>> {
  return apiCall<User[]>(`/admin/manage/reader?page=${page}&limit=${limit}`, {
    method: "GET",
  })
}

/**
 * Register users in bulk (JSON array)
 */
export async function registerUsersBulk(
  users: RegisterUserPayload[]
): Promise<ApiResponse<BulkUserResponse>> {
  return apiCall<BulkUserResponse>("/admin/manage/reader/register-users", {
    method: "POST",
    body: JSON.stringify(users),
  })
}

/**
 * Register users via Excel file upload
 */
export async function registerUsersByFile(
  file: File
): Promise<ApiResponse<BulkUserResponse>> {
  const formData = new FormData()
  formData.append("file", file)

  return apiCall<BulkUserResponse>("/admin/manage/reader/register-users", {
    method: "POST",
    body: formData,
  })
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
): Promise<ApiResponse<User>> {
  return apiCall<User>(`/admin/manage/reader/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  })
}

/**
 * Reset user password
 */
export async function resetUserPassword(
  userId: string,
  password: string
): Promise<ApiResponse<{ message: string }>> {
  return apiCall<{ message: string }>(
    `/admin/manage/reader/reset-password/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify({ password }),
    }
  )
}
