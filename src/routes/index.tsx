import { createFileRoute } from '@tanstack/react-router'
import { DownloadIcon, PlusIcon } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Page } from '@/ui/page'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const stats = [
  { label: 'Total users', value: '10,000', change: '+12.5%' },
  { label: 'Active today', value: '1,284', change: '+4.1%' },
  { label: 'New this month', value: '342', change: '+8.3%' },
  { label: 'Open tickets', value: '27', change: '-2.0%' },
]

function Dashboard() {
  return (
    <Page
      title="Dashboard"
      description="Overview of your workspace."
      toolbar={
        <>
          <Button variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button>
            <PlusIcon data-icon="inline-start" />
            New report
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
              <CardAction>
                <Badge variant="secondary">{stat.change}</Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Page>
  )
}
