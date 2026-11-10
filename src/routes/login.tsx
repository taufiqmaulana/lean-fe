import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { CircleAlertIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { app } from '@/lib/app'
import { auth, safeRedirect } from '@/lib/auth'
import { demoCredentials } from '@/lib/demo'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/ui/field'
import { Input } from '@/ui/input'
import { Spinner } from '@/ui/spinner'
import { ThemeToggle } from '@/ui/theme-toggle'

type LoginSearch = { redirect?: string }

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  // Already signed in: skip the form
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) throw redirect({ href: safeRedirect(search.redirect) })
  },
  component: Login,
})

function Login() {
  const router = useRouter()
  const search = Route.useSearch()

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      auth.login(email, password),
    onSuccess: () => router.navigate({ href: safeRedirect(search.redirect), replace: true }),
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    login.mutate({ email: String(form.get('email')), password: String(form.get('password')) })
  }

  return (
    <div className="bg-muted relative flex min-h-svh items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-semibold">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <app.icon />
          </div>
          {app.title}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email and password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <FieldGroup>
                {login.isError && (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Sign in failed</AlertTitle>
                    <AlertDescription>{login.error.message}</AlertDescription>
                  </Alert>
                )}
                <Field data-invalid={login.isError || undefined}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    aria-invalid={login.isError || undefined}
                    required
                    autoFocus
                  />
                </Field>
                <Field data-invalid={login.isError || undefined}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={login.isError || undefined}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={login.isPending}>
                    {login.isPending && <Spinner data-icon="inline-start" />}
                    Sign in
                  </Button>
                  <FieldDescription className="text-center">
                    Demo: {demoCredentials.email} / {demoCredentials.password}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
