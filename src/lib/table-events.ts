import { EventClient } from '@tanstack/devtools-event-client'
import type { SortingState } from '@tanstack/react-table'

// Typed runtime events emitted by <DataTable> for the "Data Tables" devtools panel.
// The default `EventClient` export is a no-op outside development, so these
// calls cost nothing in production.

type Request = {
  tableId: string
  requestId: number
  cursor: unknown
  pageSize: number
  filters: Record<string, string>
  sorting: SortingState
}

export type DataTableEvents = {
  /** Current table state; emitted whenever filters, sorting or loaded data change. */
  state: {
    tableId: string
    status: 'pending' | 'error' | 'success'
    filters: Record<string, string>
    sorting: SortingState
    loadedRows: number
    total: number
    hasNextPage: boolean
  }
  /** A page request started. */
  request: Request & { startedAt: number }
  /** A page request finished. */
  response: { tableId: string; requestId: number; rows: number; total: number; durationMs: number }
  /** A page request failed. */
  error: { tableId: string; requestId: number; message: string; durationMs: number }
  /** The table left the page. */
  unmount: { tableId: string }
}

class DataTableDevtoolsClient extends EventClient<DataTableEvents> {
  constructor() {
    super({ pluginId: 'lean-fe-data-table' })
  }
}

/** Module-level singleton: one client per plugin. */
export const dataTableEvents = new DataTableDevtoolsClient()

let nextRequestId = 1

/** Wraps a page fetch with request/response/error events. */
export async function trackRequest<T extends { rows: unknown[]; total: number }>(
  request: Omit<Request, 'requestId'>,
  run: () => Promise<T>,
): Promise<T> {
  const requestId = nextRequestId++
  const startedAt = performance.now()
  dataTableEvents.emit('request', { ...request, requestId, startedAt: Date.now() })
  try {
    const page = await run()
    dataTableEvents.emit('response', {
      tableId: request.tableId,
      requestId,
      rows: page.rows.length,
      total: page.total,
      durationMs: Math.round(performance.now() - startedAt),
    })
    return page
  } catch (error) {
    dataTableEvents.emit('error', {
      tableId: request.tableId,
      requestId,
      message:
        error instanceof Error && error.name === 'AbortError'
          ? 'cancelled (superseded or unmounted)'
          : error instanceof Error
            ? error.message
            : String(error),
      durationMs: Math.round(performance.now() - startedAt),
    })
    throw error
  }
}
