import { BarChart3, Book, BookMarked, BookSearch, LayoutDashboard, Users } from "lucide-react"
import React from "react"

// Match these exactly with your OpenAPI spec enums
export type UserRole = "READER" | "ADMIN" | "ROOT_ADMIN"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  allowedRoles: UserRole[]
}

export const HomeItems: NavItem[] = [
  {
    title: "Home",
    href: "/home",
    icon: BookSearch,
    allowedRoles: ["ADMIN", "ROOT_ADMIN", "READER"],
  }
]

export const OverviewItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "ROOT_ADMIN"],
  },
  {
    title: "Audit Logs",
    href: "/logs",
    icon: BarChart3,
    allowedRoles: ["ADMIN", "ROOT_ADMIN"],
  },
];

export const ManageItems: NavItem[] = [
  {
    title: "Users",
    href: "/manage/users",
    icon: Users,
    allowedRoles: ["ROOT_ADMIN", "ADMIN"],
  },
  {
    title: "Books",
    href: "/manage/books",
    icon: Book,
    allowedRoles: ["ROOT_ADMIN", "ADMIN"],
  },
]

export const PersonalItems: NavItem[] = [
  {
    title: "My Favorites",
    href: "/favorites",
    icon: BookMarked,
    allowedRoles: ["READER", "ADMIN", "ROOT_ADMIN"],
  },
]
