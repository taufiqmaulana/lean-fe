import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { FileQuestionIcon } from 'lucide-react'
import type { Auth } from '@/lib/auth'
import { Button } from '@/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/empty'

// Public routes (login) render directly under the root; protected pages live
// under the `_app` layout route, which checks the session first.
export const Route = createRootRouteWithContext<{ queryClient: QueryClient; auth: Auth }>()({
  component: Outlet,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>The page you are looking for does not exist.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" render={<Link to="/" />} nativeButton={false}>
          Back to dashboard
        </Button>
      </EmptyContent>
    </Empty>
  )
}
