import { currentUser } from '@/lib/demo'
import { NavUser } from '@/ui/nav-user'
import { Separator } from '@/ui/separator'
import { SidebarTrigger } from '@/ui/sidebar'
import { ThemeToggle } from '@/ui/theme-toggle'

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Separator
          orientation="vertical"
          className="mx-1 data-vertical:h-6 data-vertical:self-auto"
        />
        <NavUser user={currentUser} />
      </div>
    </header>
  )
}
