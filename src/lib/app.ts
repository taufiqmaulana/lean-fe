import type { LinkProps } from '@tanstack/react-router'
import {
  BarChart3Icon,
  BoxesIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'

export const app = {
  title: 'Lean FE',
  description: 'Admin console',
  icon: BoxesIcon,
}

export type MenuItem = {
  title: string
  icon?: LucideIcon
  /** Leaf items link somewhere; parent items group `items`. */
  to?: LinkProps['to']
  items?: MenuItem[]
}

export const menu: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, to: '/' },
  { title: 'Users', icon: UsersIcon, to: '/users' },
  {
    title: 'Reports',
    icon: BarChart3Icon,
    items: [
      { title: 'Sales', to: '/reports/sales' },
      {
        title: 'Inventory',
        icon: PackageIcon,
        items: [
          { title: 'Stock', to: '/reports/inventory/stock' },
          { title: 'Movement', to: '/reports/inventory/movement' },
        ],
      },
    ],
  },
  {
    title: 'Settings',
    icon: SettingsIcon,
    items: [
      { title: 'General', to: '/settings/general' },
      { title: 'Security', to: '/settings/security' },
    ],
  },
]

/** True when the item (or any descendant) matches the current path. */
export function isMenuItemActive(item: MenuItem, pathname: string): boolean {
  if (item.to) {
    return item.to === '/'
      ? pathname === '/'
      : pathname === item.to || pathname.startsWith(`${item.to}/`)
  }
  return item.items?.some((child) => isMenuItemActive(child, pathname)) ?? false
}
