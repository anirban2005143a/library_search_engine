// will contain the column information
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/component/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/component/ui/dropdown-menu"
import { Checkbox } from "@/component/ui/checkbox"
import { ArrowUpDown } from "lucide-react"

// This type is used to define the shape of our data.
export type User = {
  id: string
  firstName: string
  lastName: string | null
  email: string
  createdAt: string
  createdBy: string | null
  role: "ROOT_ADMIN" | "ADMIN" | "READER"
}

const HighlightedText = ({
  text,
  highlight,
}: {
  text: string
  highlight: string
}) => {
  if (!highlight.trim()) return <span>{text}</span>

  const regex = new RegExp(`(${highlight})`, "gi")
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="rounded-sm bg-emerald-400/30 px-0.5 text-emerald-400"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    header: ({ column }) => {
      return (
        <Button
          className="p-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-0.5 h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row, table }) => {
      const firstName = row.original.firstName
      const lastName = row.original.lastName || ""
      const fullName = `${firstName} ${lastName}`.trim()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter = (table.getState() as any).globalFilter || ""
      return <HighlightedText text={fullName} highlight={filter} />
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          className="p-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-0.5 h-2 w-2" />
        </Button>
      )
    },
    cell: ({ getValue, table }) => {
      const text = getValue() as string
      // Grab the filter state from the table instance!
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter = (table.getState() as any).globalFilter || ""
      return <HighlightedText text={text} highlight={filter} />
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          className="p-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-0.5 h-2 w-2" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              Copy email ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>View User</DropdownMenuItem>
            <DropdownMenuItem disabled>Disable User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
