import { useSyncExternalStore } from 'react'
import { mockLogin } from '@/lib/demo'

export type User = { name: string; email: string; description?: string; avatar?: string }
export type Session = { token: string; user: User }

const STORAGE_KEY = 'session'

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

let session = readSession()
const listeners = new Set<() => void>()
const notify = () => {
  for (const listener of listeners) listener()
}

function setSession(next: Session | null) {
  session = next
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable; the session lasts until the tab closes
  }
  notify()
}

// Keep tabs in sync: logging out in one tab logs out the others
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  session = readSession()
  notify()
})

/** Session store. Passed to the router context so route guards can read it. */
export const auth = {
  get user() {
    return session?.user ?? null
  },
  get token() {
    return session?.token ?? null
  },
  isAuthenticated: () => session !== null,
  async login(email: string, password: string) {
    // Replace with a real endpoint, e.g. api<Session>('/auth/login', { method: 'POST', ... })
    setSession(await mockLogin(email, password))
  },
  logout: () => setSession(null),
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
export type Auth = typeof auth

/** Reactive session for components. */
export function useAuth() {
  const current = useSyncExternalStore(auth.subscribe, () => session)
  return { session: current, user: current?.user ?? null }
}

/** Only allows in-app paths as a post-login target, to prevent open redirects. */
export function safeRedirect(target: unknown): string {
  return typeof target === 'string' && /^\/(?![/\\])/.test(target) ? target : '/'
}
