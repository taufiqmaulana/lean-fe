import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { UserAvatar } from '@/ui/nav-user'
import { Page } from '@/ui/page'

export const Route = createFileRoute('/_app/profile')({
  component: Profile,
})

function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <Page title="Profile" description="Your account information.">
      <Card className="max-w-xl">
        <CardHeader className="flex items-center gap-4">
          <UserAvatar user={user} className="size-14" />
          <div className="flex flex-col gap-1">
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <CardDescription>{user.description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Page>
  )
}
