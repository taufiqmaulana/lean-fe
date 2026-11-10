import type { CSSProperties } from 'react'
import { useSyncExternalStore } from 'react'
import { type DataTableEvents, dataTableEvents } from '@/lib/table-events'

// "Data Tables" panel for TanStack Devtools. It is imported only by the
// <TanStackDevtools> plugins list, so the build strips it from production.

type TableState = DataTableEvents['state'] & { mounted: boolean }
type RequestEntry = DataTableEvents['request'] & {
  status: 'pending' | 'ok' | 'error'
  rows?: number
  total?: number
  durationMs?: number
  message?: string
}

// --- Store: subscribed once at module load, so history survives closing the panel ---

let tables = new Map<string, TableState>()
let requests: RequestEntry[] = []
let snapshot = { tables: [] as TableState[], requests: [] as RequestEntry[] }
const listeners = new Set<() => void>()

function commit() {
  snapshot = { tables: [...tables.values()], requests: [...requests] }
  for (const listener of listeners) listener()
}

function updateRequest(requestId: number, patch: Partial<RequestEntry>) {
  requests = requests.map((r) => (r.requestId === requestId ? { ...r, ...patch } : r))
  commit()
}

const cleanups = [
  dataTableEvents.on('state', ({ payload }) => {
    tables = new Map(tables).set(payload.tableId, { ...payload, mounted: true })
    commit()
  }),
  dataTableEvents.on('unmount', ({ payload }) => {
    const table = tables.get(payload.tableId)
    if (table) tables = new Map(tables).set(payload.tableId, { ...table, mounted: false })
    commit()
  }),
  dataTableEvents.on('request', ({ payload }) => {
    requests = [{ ...payload, status: 'pending' as const }, ...requests].slice(0, 100)
    commit()
  }),
  dataTableEvents.on('response', ({ payload }) =>
    updateRequest(payload.requestId, { status: 'ok', ...payload }),
  ),
  dataTableEvents.on('error', ({ payload }) =>
    updateRequest(payload.requestId, { status: 'error', ...payload }),
  ),
]
import.meta.hot?.dispose(() => {
  for (const cleanup of cleanups) cleanup()
})

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const clearRequests = () => {
  requests = []
  commit()
}

// --- Panel ---

const palettes = {
  light: {
    fg: '#18181b',
    muted: '#71717a',
    border: '#e4e4e7',
    ok: '#15803d',
    error: '#b91c1c',
    pending: '#a16207',
  },
  dark: {
    fg: '#f4f4f5',
    muted: '#a1a1aa',
    border: '#3f3f46',
    ok: '#4ade80',
    error: '#f87171',
    pending: '#facc15',
  },
}

const json = (value: unknown) => {
  const text = JSON.stringify(value)
  return text === '{}' || text === '[]' ? '—' : text
}

export function DataTableDevtoolsPanel({ theme }: { theme: 'light' | 'dark' }) {
  const { tables, requests } = useSyncExternalStore(subscribe, () => snapshot)
  const c = palettes[theme]
  const cell: CSSProperties = {
    padding: '4px 8px',
    borderBottom: `1px solid ${c.border}`,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  }
  const head: CSSProperties = { ...cell, color: c.muted, fontWeight: 500 }
  const statusColor = { ok: c.ok, success: c.ok, error: c.error, pending: c.pending }

  return (
    <div
      style={{
        padding: 12,
        color: c.fg,
        font: '12px/1.5 ui-monospace, monospace',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Tables ({tables.length})</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 16 }}>
        <thead>
          <tr>
            {['Table', 'Status', 'Loaded', 'More', 'Filters', 'Sorting'].map((h) => (
              <th key={h} style={head}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tables.map((t) => (
            <tr key={t.tableId} style={{ opacity: t.mounted ? 1 : 0.5 }}>
              <td style={cell}>
                {t.tableId}
                {t.mounted ? '' : ' (unmounted)'}
              </td>
              <td style={{ ...cell, color: statusColor[t.status] }}>{t.status}</td>
              <td style={cell}>
                {t.loadedRows} / {t.total}
              </td>
              <td style={cell}>{t.hasNextPage ? 'yes' : 'no'}</td>
              <td style={cell}>{json(t.filters)}</td>
              <td style={cell}>{json(t.sorting)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 13 }}>Requests ({requests.length})</h3>
        <button
          type="button"
          onClick={clearRequests}
          style={{
            marginLeft: 'auto',
            font: 'inherit',
            color: 'inherit',
            background: 'transparent',
            border: `1px solid ${c.border}`,
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {['#', 'Time', 'Table', 'Cursor', 'Filters', 'Sorting', 'Result', 'Duration'].map(
              (h) => (
                <th key={h} style={head}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.requestId}>
              <td style={cell}>{r.requestId}</td>
              <td style={cell}>{new Date(r.startedAt).toLocaleTimeString()}</td>
              <td style={cell}>{r.tableId}</td>
              <td style={cell}>{r.cursor == null ? 'first' : String(r.cursor)}</td>
              <td style={cell}>{json(r.filters)}</td>
              <td style={cell}>{json(r.sorting)}</td>
              <td style={{ ...cell, color: statusColor[r.status] }}>
                {r.status === 'ok'
                  ? `${r.rows} rows of ${r.total}`
                  : r.status === 'error'
                    ? r.message
                    : '…'}
              </td>
              <td style={cell}>{r.durationMs == null ? '' : `${r.durationMs} ms`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
