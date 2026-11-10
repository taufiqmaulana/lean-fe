import { Link } from '@tanstack/react-router'
import { ChevronDownIcon, UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'

type User = { name: string; email: string; description?: string; avatar?: string }

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

function UserAvatar({ user, className }: { user: User; className?: string }) {
  return (
    <Avatar className={className}>
      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  )
}

/** Header user menu: avatar (+ name and description from `sm` up) opening a profile popup. */
export function NavUser({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-auto gap-2 px-1.5 py-1" />}
        aria-label="Open user menu"
      >
        <UserAvatar user={user} />
        <div className="hidden max-w-40 text-left text-sm leading-tight sm:grid">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user.description}
          </span>
        </div>
        <ChevronDownIcon className="text-muted-foreground hidden sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-foreground flex items-center gap-3 py-2">
            <UserAvatar user={user} className="size-10" />
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              {user.description && (
                <span className="text-muted-foreground truncate text-xs">{user.description}</span>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/profile" />}>
            <UserIcon />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
