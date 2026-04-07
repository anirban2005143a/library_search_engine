"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"

function DashboardContent() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ROOT_ADMIN"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}