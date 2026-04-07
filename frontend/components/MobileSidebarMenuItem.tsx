"use client"

import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

interface MobileSidebarMenuItemProps {
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  isActive: boolean
}

export function MobileSidebarMenuItem({
  href,
  icon: Icon,
  title,
  isActive,
}: MobileSidebarMenuItemProps) {
  const { setOpenMobile, isMobile } = useSidebar()
  const isMobileDevice = useIsMobile()

  const handleClick = () => {
    // Close sidebar on mobile after clicking a link
    if (isMobileDevice && isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={href} onClick={handleClick}>
          <Icon />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
