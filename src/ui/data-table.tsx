import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  columnFilteringFeature,
  columnSizingFeature,
  createColumnHelper,
  type RowData,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from 'cn'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, SearchXIcon, XIcon } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { dataTableEvents, trackRequest } from '@/lib/table-events'
import { Button } from '@/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/empty'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import { Spinner } from '@/ui/spinner'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataTableFilter =
  | { type: 'text'; placeholder?: string }
  | { type: 'select'; options: { label: string; value: string }[] }

type DataTableColumnMeta = {
  /** Renders a filter control for this column in the header filter row. */
  filter?: DataTableFilter
}

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  columnSizingFeature,
  columnMeta: {} as DataTableColumnMeta,
})
type Features = typeof dataTableFeatures

/** Column helper bound to the DataTable feature set: `const col = createColumns<User>()`. */
export const createColumns = <T extends RowData>() => createColumnHelper<Features, T>()

export type DataTableCursor = string | number | null | undefined

/** What the table sends to the server for each page. */
export type DataTableQuery = {
  /** `undefined` for the first page, then the previous page's `nextCursor`. */
  cursor: DataTableCursor
  pageSize: number
  /** Column id → filter value; only active filters are included. */
  filters: Record<string, string>
  sorting: SortingState
  signal?: AbortSignal
}

/** What the server returns for each page. */
export type DataTablePage<T> = {
  rows: T[]
  /** `null`/`undefined` when there are no more pages. */
  nextCursor?: DataTableCursor
  total: number
}

type ToolbarContext = {
  filters: Record<string, string>
  sorting: SortingState
  total: number
  resetFilters: () => void
}

type DataTableProps<T extends RowData> = {
  // biome-ignore lint/suspicious/noExplicitAny: column value types vary per column
  columns: ColumnDef<Features, T, any>[]
  /** Base query key; filters and sorting are appended automatically. */
  queryKey: readonly unknown[]
  fetchPage: (query: DataTableQuery) => Promise<DataTablePage<T>>
  getRowId: (row: T) => string
  pageSize?: number
  /** Estimated row height in px, used by the virtualizer. */
  rowHeight?: number
  /** Custom content on the left of the table toolbar. */
  toolbar?: ReactNode | ((context: ToolbarContext) => ReactNode)
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const emptyRows: never[] = []

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function DataTable<T extends RowData>({
  columns,
  queryKey,
  fetchPage,
  getRowId,
  pageSize = 50,
  rowHeight = 41,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Inputs update instantly; the server request waits for typing to pause
  const debouncedFilters = useDebounced(columnFilters)
  const filters = useMemo(
    () =>
      Object.fromEntries(
        debouncedFilters
          .filter((f) => f.value != null && String(f.value) !== '')
          .map((f) => [f.id, String(f.value)]),
      ),
    [debouncedFilters],
  )

  const tableId = JSON.stringify(queryKey)
  const query = useInfiniteQuery({
    queryKey: [...queryKey, { filters, sorting, pageSize }],
    queryFn: ({ pageParam, signal }) =>
      trackRequest({ tableId, cursor: pageParam, pageSize, filters, sorting }, () =>
        fetchPage({ cursor: pageParam, pageSize, filters, sorting, signal }),
      ),
    initialPageParam: undefined as DataTableCursor,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  })

  const data = useMemo(
    () => query.data?.pages.flatMap((page) => page.rows) ?? (emptyRows as T[]),
    [query.data],
  )
  const total = query.data?.pages[0]?.total ?? 0

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualSorting: true,
    manualFiltering: true,
  })

  const rows = table.getRowModel().rows
  const leafColumns = table.getAllLeafColumns()
  const hasFilterRow = leafColumns.some((c) => c.columnDef.meta?.filter)
  const resetFilters = () => setColumnFilters([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    getItemKey: (index) => rows[index].id,
    overscan: 10,
  })
  const items = virtualizer.getVirtualItems()
  const paddingTop = items[0]?.start ?? 0
  const paddingBottom = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0)

  // Infinite scroll: fetch the next page when nearing the end
  const lastIndex = items.at(-1)?.index ?? -1
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  useEffect(() => {
    if (lastIndex >= rows.length - 10 && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [lastIndex, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Report state to the "Data Tables" devtools panel (no-op in production)
  useEffect(() => {
    dataTableEvents.emit('state', {
      tableId,
      status: query.status,
      filters,
      sorting,
      loadedRows: rows.length,
      total,
      hasNextPage,
    })
  }, [tableId, query.status, filters, sorting, rows.length, total, hasNextPage])
  useEffect(() => () => dataTableEvents.emit('unmount', { tableId }), [tableId])

  // New filters or sorting: jump back to the top
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when the request changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [filters, sorting])

  const colSpan = leafColumns.length
  const isFiltered = columnFilters.length > 0

  return (
    <div data-slot="data-table" className={cn('flex min-h-80 flex-1 flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {typeof toolbar === 'function'
          ? toolbar({ filters, sorting, total, resetFilters })
          : toolbar}
        <div className="text-muted-foreground ml-auto flex items-center gap-2 text-sm">
          {query.isFetching && <Spinner />}
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <XIcon data-icon="inline-start" />
              Clear filters
            </Button>
          )}
          <span>
            {rows.length.toLocaleString()} of {total.toLocaleString()} rows
          </span>
        </div>
      </div>

      {/* The scroller is absolutely positioned so its rows never stretch the page:
          the table fills the remaining height and scrolls on its own */}
      <div className="relative min-h-80 flex-1">
        <div
          ref={scrollRef}
          className={cn(
            'absolute inset-0 overflow-auto rounded-lg border',
            query.isPlaceholderData && 'opacity-60',
          )}
        >
          <table
            data-slot="table"
            className="w-full table-fixed caption-bottom text-sm"
            style={{ minWidth: table.getTotalSize() }}
          >
            <TableHeader className="bg-background sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--color-border)]">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2.5"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          <SortIcon direction={header.column.getIsSorted()} />
                        </Button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
              {hasFilterRow && (
                <TableRow className="hover:bg-transparent">
                  {leafColumns.map((column) => (
                    <TableHead key={column.id} className="py-1">
                      <ColumnFilter column={column} />
                    </TableHead>
                  ))}
                </TableRow>
              )}
            </TableHeader>

            <TableBody>
              {query.isPending ? (
                Array.from({ length: 8 }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
                  <TableRow key={i}>
                    {leafColumns.map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-4 w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : query.isError ? (
                <StateRow colSpan={colSpan}>
                  <EmptyHeader>
                    <EmptyTitle>Couldn&apos;t load data</EmptyTitle>
                    <EmptyDescription>{query.error.message}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                      Try again
                    </Button>
                  </EmptyContent>
                </StateRow>
              ) : rows.length === 0 ? (
                <StateRow colSpan={colSpan}>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchXIcon />
                    </EmptyMedia>
                    <EmptyTitle>No results</EmptyTitle>
                    <EmptyDescription>
                      {isFiltered
                        ? 'No rows match the current filters.'
                        : 'There is nothing here yet.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  {isFiltered && (
                    <EmptyContent>
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    </EmptyContent>
                  )}
                </StateRow>
              ) : (
                <>
                  {paddingTop > 0 && <tr aria-hidden style={{ height: paddingTop }} />}
                  {items.map((item) => {
                    const row = rows[item.index]
                    return (
                      <TableRow
                        key={row.id}
                        data-index={item.index}
                        ref={virtualizer.measureElement}
                      >
                        {row.getAllCells().map((cell) => (
                          <TableCell key={cell.id} className="truncate">
                            <table.FlexRender cell={cell} />
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                  {paddingBottom > 0 && <tr aria-hidden style={{ height: paddingBottom }} />}
                  {isFetchingNextPage && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={colSpan}>
                        <div className="text-muted-foreground flex items-center justify-center gap-2">
                          <Spinner />
                          Loading more…
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') return <ArrowUpIcon data-icon="inline-end" />
  if (direction === 'desc') return <ArrowDownIcon data-icon="inline-end" />
  return <ArrowUpDownIcon data-icon="inline-end" className="opacity-40" />
}

function StateRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan}>
        <Empty>{children}</Empty>
      </TableCell>
    </TableRow>
  )
}

function ColumnFilter<T extends RowData>({ column }: { column: Column<Features, T, unknown> }) {
  const filter = column.columnDef.meta?.filter
  if (!filter) return null
  const value = (column.getFilterValue() as string | undefined) ?? ''

  if (filter.type === 'select') {
    const items = [{ label: 'All', value: '' }, ...filter.options]
    return (
      <Select
        items={items}
        value={value}
        onValueChange={(next) => column.setFilterValue(next || undefined)}
      >
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      value={value}
      onChange={(event) => column.setFilterValue(event.target.value || undefined)}
      placeholder={filter.placeholder ?? 'Filter…'}
      className="h-8 font-normal"
    />
  )
}
