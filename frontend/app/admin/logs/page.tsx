"use client"

import { useState, useEffect } from "react"
import { getAuditLogs, AuditLog } from "@/lib/api/auditLogs"
import { useAuth } from "@/hooks/useAuth"
import { ApiError } from "@/lib/api/client"
import { Button } from "@/component/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"

function AuditLogsContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const LOGS_PER_PAGE = 20

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setError("No authentication token found. Please provide a JWT token.")
      setLoading(false)
      return
    }

    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getAuditLogs(currentPage, LOGS_PER_PAGE)

        // Handle both possible response structures
        const logsData = response.data?.data || response.data || []
        const pagination = response.data?.pagination || response.pagination

        setLogs(Array.isArray(logsData) ? logsData : [])
        if (pagination) {
          setTotalPages(pagination.pages || 1)
          setTotalLogs(pagination.total || 0)
        }
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new Error(String(err))
        setError(apiError.message)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [isAuthenticated, authLoading, currentPage])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch {
      return dateString
    }
  }

  const getActionBadgeColor = (action: string) => {
    const baseClass = "inline-block rounded-full px-2 py-1 text-xs font-medium"
    if (action.includes("CREATE") || action.includes("REGISTER")) {
      return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`
    }
    if (action.includes("UPDATE") || action.includes("PASSWORD")) {
      return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
    }
    if (action.includes("DELETE")) {
      return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
    }
    return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track all system activities and user actions
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Total Logs
          </span>
          <span className="mt-1 block text-2xl font-bold">
            {loading ? "-" : totalLogs}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Current Page
          </span>
          <span className="mt-1 block text-2xl font-bold">
            {loading ? "-" : `${currentPage} / ${totalPages}`}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Logs Per Page
          </span>
          <span className="mt-1 block text-2xl font-bold">{LOGS_PER_PAGE}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24">Action</TableHead>
                <TableHead className="w-20">Entity</TableHead>
                <TableHead className="w-32">Actor</TableHead>
                <TableHead className="w-40">Email</TableHead>
                <TableHead className="w-32">Date & Time</TableHead>
                <TableHead className="w-20 text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-emerald-400"></div>
                      <span className="text-sm text-muted-foreground">
                        Loading logs...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      <span className={getActionBadgeColor(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{log.entity}</TableCell>
                    <TableCell className="text-sm">
                      {log.actor
                        ? `${log.actor.firstName} ${log.actor.lastName}`
                        : "System"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.actorEmail}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.details ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log("Details:", log.details)
                            alert(JSON.stringify(log.details, null, 2))
                          }}
                        >
                          View
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && logs.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            Showing page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AuditLogsPage() {
  return <AuditLogsContent />
}
