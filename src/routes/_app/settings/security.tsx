import { createFileRoute } from '@tanstack/react-router'
import { ConstructionIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/ui/empty'
import { Page } from '@/ui/page'

export const Route = createFileRoute('/_app/settings/security')({
  component: SecurityPage,
})

function SecurityPage() {
  return (
    <Page title="Security" description="Password and session settings.">
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
