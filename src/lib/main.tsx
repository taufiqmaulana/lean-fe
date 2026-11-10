import '@/lib/styles.css'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from '@/lib/query'
import { router } from '@/lib/router'
import { ThemeProvider } from '@/lib/theme'
import { DataTableDevtoolsPanel } from '@/ui/data-table-devtools'
import { TooltipProvider } from '@/ui/tooltip'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>

    {/* Mounted once for the whole app. The Vite plugin removes this element and
        the imports only it uses from production builds. Toggle: Ctrl+~ */}
    <TanStackDevtools
      plugins={[
        {
          id: 'tanstack-router',
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel router={router} />,
        },
        {
          id: 'tanstack-query',
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel client={queryClient} />,
        },
        {
          id: 'data-tables',
          name: 'Data Tables',
          render: (_el, { theme }) => <DataTableDevtoolsPanel theme={theme} />,
        },
      ]}
    />
  </StrictMode>,
)
