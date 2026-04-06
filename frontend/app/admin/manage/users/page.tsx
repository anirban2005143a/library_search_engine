"use client"
import { columns, User } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState, useCallback } from "react"
import { Input } from "@/component/ui/input"
import AddUsersInBulk from "@/component/BulkAddUsers"
import { getAllUsers } from "@/lib/api/users"
import { useAuth } from "@/hooks/useAuth"
import { ApiError } from "@/lib/api/client"

function UsersContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [data, setData] = useState<User[]>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllUsers(1, 100)
      setData(response.data || [])
      setTotalUsers(response.data?.length || 0)
      setActiveUsers(response.data?.length || 0)
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new Error(String(err))
      setError(apiError.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setError("No authentication token found. Please provide a JWT token.")
      setLoading(false)
      return
    }

    fetchUsers()
  }, [isAuthenticated, authLoading, fetchUsers])

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-6 grid w-full grid-cols-2 grid-rows-2 gap-4 pt-1 text-card-foreground sm:grid-cols-2 sm:grid-rows-1 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Total Users
          </span>
          <span className="mt-1 text-2xl font-bold">
            {loading ? "-" : totalUsers}
          </span>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 text-card-foreground transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Active Users
          </span>
          <span className="mt-1 text-2xl font-bold text-emerald-400">
            {loading ? "-" : activeUsers}
          </span>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 text-card-foreground transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Total Readers
          </span>
          <span className="mt-1 text-2xl font-bold">
            {loading ? "-" : data.filter((u) => u.role === "READER").length}
          </span>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 text-card-foreground transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Total Admins
          </span>
          <span className="mt-1 text-2xl font-bold">
            {loading
              ? "-"
              : data.filter(
                  (u) => u.role === "ADMIN" || u.role === "ROOT_ADMIN"
                ).length}
          </span>
        </div>
      </div>

      <div className="container mx-auto py-10">
        {/* Controls Area */}
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="max-w-sm md:w-full">
            <Input
              placeholder="Search all users..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="placeholder:text-accent-foreground-muted border-border bg-popover text-foreground focus-visible:ring-emerald-400"
            />
          </div>
          <AddUsersInBulk onSuccess={fetchUsers} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-md border border-border p-8">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-emerald-400"></div>
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-md border border-border p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
          />
        )}
      </div>
    </>
  )
}

export default function Users() {
  return <UsersContent />
}
