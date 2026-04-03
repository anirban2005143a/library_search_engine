"use client"
import { Button } from "@/components/ui/button"
import { columns, User } from "./columns"
import { DataTable } from "./data-table"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// async function getData(): Promise<User[]> { // would be useful when connecting with the backend
  // Fetch data from API here.
  function getData(): User[] {
  return [
    {
      id: "728ed52f",
      name: "LEZE",
      email: "root@lms.com",
      joined: "12 Apr 2026",
      createdBy: "",
      role: "ROOT_ADMIN",
    },
    {
      id: "a1b2c3d4",
      name: "John Doe",
      email: "john.doe@lms.com",
      joined: "01 Jan 2026",
      createdBy: "LEZE",
      role: "ADMIN",
    },
    {
      id: "e5f6g7h8",
      name: "Jane Smith",
      email: "jane.smith@lms.com",
      joined: "15 Feb 2026",
      createdBy: "LEZE",
      role: "READER",
    },
    {
      id: "i9j0k1l2",
      name: "Alex Johnson",
      email: "alex.johnson@lms.com",
      joined: "03 Mar 2026",
      createdBy: "John Doe",
      role: "READER",
    },
    {
      id: "m3n4o5p6",
      name: "Sarah Williams",
      email: "sarah.williams@lms.com",
      joined: "20 Mar 2026",
      createdBy: "Jane Smith",
      role: "READER",
    },
    {
      id: "q7r8s9t0",
      name: "Michael Brown",
      email: "michael.brown@lms.com",
      joined: "25 Mar 2026",
      createdBy: "Jane Smith",
      role: "READER",
    },
    {
      id: "u1v2w3x4",
      name: "Emma Davis",
      email: "emma.davis@lms.com",
      joined: "28 Mar 2026",
      createdBy: "John Doe",
      role: "ADMIN",
    },
    {
      id: "y5z6a7b8",
      name: "David Martinez",
      email: "david.martinez@lms.com",
      joined: "30 Mar 2026",
      createdBy: "LEZE",
      role: "READER",
    },
  ]
}
const results = getData()

export default function Users() {
  // 1. Fetching on the client or using dummy data for now
  // In a real app, if this is a server component, pass data down as a prop!
  const [data] = useState(results)

  // 2. State for global search
  const [globalFilter, setGlobalFilter] = useState("")

  return (
    <>
      <div className="mb-6 grid w-full grid-cols-1 gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Total Users
          </span>
          <span className="mt-1 text-2xl font-bold text-white">1,234</span>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Active Users
          </span>
          <span className="mt-1 text-2xl font-bold text-emerald-400">892</span>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Total Readers
          </span>
          <span className="mt-1 text-2xl font-bold text-white">1,100</span>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-slate-700">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Total Admins
          </span>
          <span className="mt-1 text-2xl font-bold text-white">5</span>
        </div>
      </div>

      {/* Controls Area */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search all users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border-border bg-popover text-foreground placeholder:text-accent-foreground-muted focus-visible:ring-emerald-400"
          />
        </div>
        <Button className="bg-emerald-500 font-medium text-white hover:bg-emerald-600">
          Create User
        </Button>
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} globalFilter={globalFilter} />
      </div>
    </>
  )
}
