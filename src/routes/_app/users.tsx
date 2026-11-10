import { createFileRoute } from '@tanstack/react-router'
import { DownloadIcon, PlusIcon } from 'lucide-react'
import { fetchUsers, type User } from '@/lib/demo'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { createColumns, DataTable } from '@/ui/data-table'
import { Page } from '@/ui/page'

export const Route = createFileRoute('/_app/users')({
  component: Users,
})

const col = createColumns<User>()

// Module scope keeps column definitions stable between renders
const columns = col.columns([
  col.accessor('name', {
    header: 'Name',
    size: 220,
    meta: { filter: { type: 'text', placeholder: 'Search name…' } },
  }),
  col.accessor('email', {
    header: 'Email',
    size: 280,
    meta: { filter: { type: 'text', placeholder: 'Search email…' } },
  }),
  col.accessor('role', {
    header: 'Role',
    size: 140,
    meta: {
      filter: {
        type: 'select',
        options: [
          { label: 'Admin', value: 'Admin' },
          { label: 'Editor', value: 'Editor' },
          { label: 'Viewer', value: 'Viewer' },
        ],
      },
    },
  }),
  col.accessor('status', {
    header: 'Status',
    size: 140,
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <Badge
          variant={status === 'active' ? 'default' : status === 'invited' ? 'secondary' : 'outline'}
        >
          {status}
        </Badge>
      )
    },
    meta: {
      filter: {
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Invited', value: 'invited' },
        ],
      },
    },
  }),
  col.accessor('createdAt', {
    header: 'Joined',
    size: 140,
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
])

function Users() {
  return (
    <Page
      title="Users"
      description="Server-side filtered, sorted and infinitely scrolled."
      toolbar={
        <Button>
          <PlusIcon data-icon="inline-start" />
          Add user
        </Button>
      }
    >
      <DataTable
        columns={columns}
        queryKey={['users']}
        fetchPage={fetchUsers}
        getRowId={(user) => user.id}
        toolbar={({ filters, total }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`Export ${total} rows with ${JSON.stringify(filters)}`)}
          >
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
        )}
      />
    </Page>
  )
}
