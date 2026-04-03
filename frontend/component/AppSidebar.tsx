"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/component/ui/sidebar"

import { ManageItems, OverviewItems, PersonalItems, UserRole } from "@/lib/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarProfile } from "./SidebarProfile"
import SidebarHeaderT from "./SidebarHeaderT"

export function AppSidebar() {
  const pathname = usePathname()

  const currentRole: UserRole = "ROOT_ADMIN"
  const manageItems = ManageItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  )

  const overviewItems = OverviewItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  )
  const personalItems = PersonalItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  )
  // -------------------
  // menuItems.map()

  // ----------------------------------------
  // |  link to user profile {              |
  // | avatar username LogOut/switchaccount |
  // |  }                                   |
  // ----------------------------------------
  // -------------------

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarHeaderT />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {overviewItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {manageItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {personalItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* We use flex layout to push it to the absolute bottom. */}
      <div className="mt-auto pt-4">
        <SidebarProfile />
      </div>
    </Sidebar>
  )
}
