import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { app, menu } from '@/lib/app'
import { NavMenu } from '@/ui/nav-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/ui/sidebar'

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Close the mobile sheet after navigating
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on pathname change only
  useEffect(() => setOpenMobile(false), [pathname])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={app.title} render={<Link to="/" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <app.icon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{app.title}</span>
                <span className="text-muted-foreground truncate text-xs">{app.description}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMenu label="Menu" items={menu} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
