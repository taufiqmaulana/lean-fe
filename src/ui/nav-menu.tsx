import { Link, useRouterState } from '@tanstack/react-router'
import { CheckIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isMenuItemActive, type MenuItem } from '@/lib/app'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/ui/sidebar'

type ItemProps = { item: MenuItem; pathname: string }

export function NavMenu({ items, label }: { items: MenuItem[]; label?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <TopItem key={item.title} item={item} pathname={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

/** Open state that starts open on the active branch and re-opens when navigated into. */
function useBranchOpen(active: boolean) {
  const [open, setOpen] = useState(active)
  useEffect(() => {
    if (active) setOpen(true)
  }, [active])
  return [open, setOpen] as const
}

const chevron = (
  <ChevronRightIcon className="ml-auto transition-transform in-data-panel-open:rotate-90" />
)

function TopItem({ item, pathname }: ItemProps) {
  const { state, isMobile } = useSidebar()
  const active = isMenuItemActive(item, pathname)
  const [open, setOpen] = useBranchOpen(active)
  const Icon = item.icon

  if (!item.items) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={active} tooltip={item.title} render={<Link to={item.to} />}>
          {Icon && <Icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Collapsed to icons: show children in a flyout menu instead
  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton isActive={active} tooltip={item.title} />}
          >
            {Icon && <Icon />}
            <span>{item.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
              <FlyoutItems items={item.items} pathname={pathname} />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
        {Icon && <Icon />}
        <span>{item.title}</span>
        {chevron}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((child) => (
            <SubItem key={child.title} item={child} pathname={pathname} />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SubItem({ item, pathname }: ItemProps) {
  const active = isMenuItemActive(item, pathname)
  const [open, setOpen] = useBranchOpen(active)
  const Icon = item.icon

  if (!item.items) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton isActive={active} render={<Link to={item.to} />}>
          {Icon && <Icon />}
          <span>{item.title}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuSubItem />}>
      <CollapsibleTrigger render={<SidebarMenuSubButton render={<button type="button" />} />}>
        {Icon && <Icon />}
        <span>{item.title}</span>
        {chevron}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((child) => (
            <SubItem key={child.title} item={child} pathname={pathname} />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FlyoutItems({ items, pathname }: { items: MenuItem[]; pathname: string }) {
  return items.map((item) => {
    const Icon = item.icon
    if (item.items) {
      return (
        <DropdownMenuSub key={item.title}>
          <DropdownMenuSubTrigger>
            {Icon && <Icon />}
            {item.title}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-44">
            <DropdownMenuGroup>
              <FlyoutItems items={item.items} pathname={pathname} />
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )
    }
    return (
      <DropdownMenuItem key={item.title} render={<Link to={item.to} />}>
        {Icon && <Icon />}
        {item.title}
        {isMenuItemActive(item, pathname) && <CheckIcon className="ml-auto" />}
      </DropdownMenuItem>
    )
  })
}
