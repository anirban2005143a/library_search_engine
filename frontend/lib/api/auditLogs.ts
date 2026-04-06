/**
 * Audit Logs API Service
 * Handles audit log-related API calls
 */

import { apiCall, ApiResponse } from "./client"

export interface AuditLogActor {
  firstName: string
  lastName: string
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  actorId: string | null
  actorEmail: string
  details: Record<string, any> | null
  createdAt: string
  actor: AuditLogActor | null
}

export interface AuditLogsResponse {
  status: string
  results: number
  pagination: {
    total: number
    page: number
    pages: number
  }
  data: AuditLog[]
}

/**
 * Fetch audit logs with pagination
 */
export async function getAuditLogs(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<AuditLogsResponse>> {
  return apiCall<AuditLogsResponse>(
    `/manage/admin/audit-logs?page=${page}&limit=${limit}`,
    {
      method: "GET",
    }
  )
}
