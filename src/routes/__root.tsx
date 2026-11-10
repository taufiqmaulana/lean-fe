import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <nav className="flex gap-4 border-b border-gray-200 px-6 py-4 text-sm">
        <Link to="/" className="[&.active]:font-semibold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-semibold">
          About
        </Link>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )}
    </div>
  )
}
