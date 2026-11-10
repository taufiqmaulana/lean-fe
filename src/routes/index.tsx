import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/ui/button'

const greetingQuery = queryOptions({
  queryKey: ['greeting'],
  queryFn: async () => ({ message: 'Hello from TanStack Query' }),
})

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(greetingQuery),
  component: Home,
})

function Home() {
  const { data } = useSuspenseQuery(greetingQuery)
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Lean FE</h1>
      <p className="text-muted-foreground">{data.message}</p>
      <Button onClick={() => alert('clicked')}>Click me</Button>
    </section>
  )
}
