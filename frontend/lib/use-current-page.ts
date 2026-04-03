"use client"

import { usePathname } from "next/navigation"
import { OverviewItems, ManageItems, PersonalItems, NavItem } from "./navigation"

export function useCurrentPage() {
  const pathname = usePathname()

  // Combine all items into a single array to search through
  const allNavItems: NavItem[] = [
    ...OverviewItems,
    ...ManageItems,
    ...PersonalItems,
  ]

  // Find the object where the URL matches the current path
  const activeItem = allNavItems.find((item) => item.href === pathname)

  return activeItem
}