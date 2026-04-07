"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import {
  ManageItems,
  OverviewItems,
  PersonalItems,
  UserRole,
  HomeItems,
} from "@/lib/navigation"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { SidebarProfile } from "./SidebarProfile"
import { MobileSidebarMenuItem } from "./MobileSidebarMenuItem"
import SidebarHeaderT from "./SidebarHeaderT"

export function AppSidebar() {
  const pathname = usePathname()
  const { decodedToken } = useAuth()

  const currentRole: UserRole = decodedToken?.role || "READER"

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
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {HomeItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <MobileSidebarMenuItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    title={item.title}
                    isActive={isActive}
                  />
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        {overviewItems.length !== 0 ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {overviewItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                      <MobileSidebarMenuItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        title={item.title}
                        isActive={isActive}
                      />
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
          </>
        ) : (
          <></>
        )}
        {manageItems.length !== 0 ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {manageItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                      <MobileSidebarMenuItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        title={item.title}
                        isActive={isActive}
                      />
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
          </>
        ) : (
          <></>
        )}
        {personalItems.length !== 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Personal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {personalItems.map((item) => {
                  const isActive = pathname === item.href

                  return (
                    <MobileSidebarMenuItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      isActive={isActive}
                    />
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <></>
        )}
      </SidebarContent>
      {/* We use flex layout to push it to the absolute bottom. */}
      <div className="mt-auto pt-4">
        <SidebarProfile />
      </div>
    </Sidebar>
  )
}
