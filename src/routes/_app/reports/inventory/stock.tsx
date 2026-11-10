import { createFileRoute } from '@tanstack/react-router'
import { ConstructionIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/ui/empty'
import { Page } from '@/ui/page'

export const Route = createFileRoute('/_app/reports/inventory/stock')({
  component: StockPage,
})

function StockPage() {
  return (
    <Page title="Stock" description="Current stock levels.">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ConstructionIcon />
          </EmptyMedia>
          <EmptyTitle>Coming soon</EmptyTitle>
          <EmptyDescription>This page is a placeholder.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Page>
  )
}
