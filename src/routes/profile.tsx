import { createFileRoute } from '@tanstack/react-router'
import { currentUser } from '@/lib/demo'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Page } from '@/ui/page'

export const Route = createFileRoute('/profile')({
  component: Profile,
})

function Profile() {
  return (
    <Page title="Profile" description="Your account information.">
      <Card className="max-w-xl">
        <CardHeader className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback>
              {currentUser.name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle>{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
            <CardDescription>{currentUser.description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Page>
  )
}
