// Demo data and a fake server. Replace with real API calls (see `api.ts`).
import type { Session } from '@/lib/auth'
import type { DataTablePage, DataTableQuery } from '@/ui/data-table'

export const demoCredentials = { email: 'demo.user@example.com', password: 'password' }

/** Simulates a login endpoint. */
export async function mockLogin(email: string, password: string): Promise<Session> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (
    email.trim().toLowerCase() !== demoCredentials.email ||
    password !== demoCredentials.password
  ) {
    throw new Error('Invalid email or password.')
  }
  return {
    token: crypto.randomUUID(),
    user: { name: 'Demo User', email: demoCredentials.email, description: 'Administrator' },
  }
}

export type User = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  status: 'active' | 'inactive' | 'invited'
  createdAt: string
}

const firstNames = ['Ayu', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko']
const lastNames = ['Santoso', 'Wijaya', 'Pratama', 'Lestari', 'Saputra', 'Hidayat', 'Kusuma']
const roles: User['role'][] = ['Admin', 'Editor', 'Viewer']
const statuses: User['status'][] = ['active', 'inactive', 'invited']

const users: User[] = Array.from({ length: 10_000 }, (_, i) => {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[(i * 7) % lastNames.length]
  return {
    id: String(i + 1),
    name: `${first} ${last} ${i + 1}`,
    email: `${first}.${last}${i + 1}@example.com`.toLowerCase(),
    role: roles[(i * 5) % roles.length],
    status: statuses[(i * 11) % statuses.length],
    createdAt: new Date(Date.UTC(2024, 0, 1) + i * 3_600_000 * 7).toISOString(),
  }
})

/** Simulates a server endpoint with filtering, sorting and cursor paging. */
export async function fetchUsers({
  cursor,
  pageSize,
  filters,
  sorting,
  signal,
}: DataTableQuery): Promise<DataTablePage<User>> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  signal?.throwIfAborted()

  let result = users.filter((user) =>
    Object.entries(filters).every(([key, value]) => {
      const field = String(user[key as keyof User]).toLowerCase()
      return key === 'role' || key === 'status'
        ? field === value.toLowerCase()
        : field.includes(value.toLowerCase())
    }),
  )
  for (const { id, desc } of [...sorting].reverse()) {
    const key = id as keyof User
    result = [...result].sort((a, b) => a[key].localeCompare(b[key]) * (desc ? -1 : 1))
  }

  const start = Number(cursor ?? 0)
  const end = start + pageSize
  return {
    rows: result.slice(start, end),
    nextCursor: end < result.length ? end : null,
    total: result.length,
  }
}
