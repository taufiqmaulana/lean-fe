import { createRouter } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { queryClient } from '@/lib/query'
import { routeTree } from '@/lib/routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient, auth },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

// Session changed (login, logout, another tab, expired token): re-run route
// guards so protected pages redirect, and drop cached data from the old session
auth.subscribe(() => {
  if (!auth.isAuthenticated()) queryClient.clear()
  router.invalidate()
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
