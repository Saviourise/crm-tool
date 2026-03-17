import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  searchPlaceholder?: string
  toolbar?: (table: Table<TData>) => React.ReactNode
  emptyMessage?: string
  emptyDescription?: string
  defaultPageSize?: number
  /** Server-side pagination: pageSize and callbacks are controlled by parent */
  serverSide?: {
    pageSize: number
    onPageSizeChange: (size: number) => void
    hasNext: boolean
    hasPrev: boolean
    onNext: () => void
    onPrev: () => void
    totalLabel?: string
  }
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  toolbar,
  emptyMessage = 'No results found',
  emptyDescription = 'Try adjusting your search or filters',
  defaultPageSize = 10,
  serverSide,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const pageSize = serverSide ? serverSide.pageSize : defaultPageSize
  const usePagination = !serverSide

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(usePagination && { getPaginationRowModel: getPaginationRowModel() }),
    initialState: {
      pagination: { pageSize },
    },
  })

  const rowModel = table.getFilteredRowModel()
  const totalRows = rowModel.rows.length
  const paginationState = table.getState().pagination
  const startRow = totalRows === 0 ? 0 : usePagination ? paginationState.pageIndex * paginationState.pageSize + 1 : 1
  const endRow = usePagination ? Math.min((paginationState.pageIndex + 1) * paginationState.pageSize, totalRows) : totalRows
  const rowCountLabel = serverSide?.totalLabel ?? (totalRows === 0 ? 'No results' : `${startRow}–${endRow} of ${totalRows}`)

  return (
    <Card className="overflow-hidden">
      {/* Toolbar — stacks on mobile */}
      <div className="flex flex-col gap-2 p-3 border-b sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value)
              table.setPageIndex(0)
            }}
            className="pl-8"
          />
        </div>
        {toolbar && (
          <div className="flex items-center gap-2 flex-wrap">
            {toolbar(table)}
          </div>
        )}
      </div>

      {/* Table — horizontally scrollable on small screens */}
      <div className="overflow-x-auto">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className={cn(
                          'flex items-center gap-1 transition-colors',
                          header.column.getIsSorted()
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-primary" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <p className="text-lg font-medium">{emptyMessage}</p>
                  <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>

      {/* Pagination — compact on mobile */}
      <div className="flex items-center justify-between px-3 py-3 border-t gap-2 sm:px-4">
        {/* Rows per page — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              const num = Number(val)
              if (serverSide) serverSide.onPageSizeChange(num)
              else {
                table.setPageSize(num)
                table.setPageIndex(0)
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row count — always visible */}
        <span className="text-xs text-muted-foreground sm:text-sm">
          {rowCountLabel}
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {serverSide ? (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={serverSide.onPrev}
                disabled={!serverSide.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={serverSide.onNext}
                disabled={!serverSide.hasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
