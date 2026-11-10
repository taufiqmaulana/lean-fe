import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppHeader } from '@/ui/app-header'
import { AppSidebar } from '@/ui/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/ui/sidebar'

// Layout for every signed-in page. The leading underscore keeps it out of the
// URL: `_app/users.tsx` is served at `/users`.
export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      // Remember where the user was going so login can send them back
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    // Fixed viewport height: sidebar and header stay put, only the content area scrolls
    <SidebarProvider
      className="h-svh"
      defaultOpen={!document.cookie.includes('sidebar_state=false')}
    >
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
