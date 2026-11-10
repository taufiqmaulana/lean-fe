import { auth } from '@/lib/auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(auth.token && { Authorization: `Bearer ${auth.token}` }),
      ...init?.headers,
    },
  })
  if (res.status === 401) {
    // Token rejected: end the session; route guards send the user to /login
    auth.logout()
    throw new Error('Your session has expired. Please sign in again.')
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}
