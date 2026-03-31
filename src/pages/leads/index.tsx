import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '@/api/leads'
import { mapApiLeadToLead } from './apiMappers'
import { LeadsHeader } from './components/LeadsHeader'
import { LeadsStats } from './components/LeadsStats'
import { LeadsTable } from './components/LeadsTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { useCsvExport } from '@/hooks/useCsvExport'

export const LEADS_QUERY_KEY = ['leads']

export default function Leads() {
  const queryClient = useQueryClient()
  const { pageSize, cursor, pageIndex, hasPrev, resetPagination, goNext, goPrev, handlePageSizeChange } = useCursorPagination()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [source, setSource] = useState<string>('all')
  const [assignedTo, setAssignedTo] = useState<string>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...LEADS_QUERY_KEY, pageSize, cursor, debouncedSearch, status, source, assignedTo],
    queryFn: () =>
      leadsApi.list({
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        status: status === 'all' ? undefined : status,
        source: source === 'all' ? undefined : source,
        assigned_to: assignedTo === 'all' ? undefined : assignedTo,
      }),
  })

  const [listReloading, setListReloading] = useState(false)
  const listBusy = isLoading || listReloading

  const handleLeadListReload = useCallback(async () => {
    setListReloading(true)
    try {
      await queryClient.refetchQueries({ queryKey: LEADS_QUERY_KEY, exact: false })
    } finally {
      setListReloading(false)
    }
  }, [queryClient])

  const response = data?.data
  const rawResults = response?.results ?? []
  const leads = rawResults.map(mapApiLeadToLead)
  const totalCount = response?.count ?? leads.length
  const nextCursor = response?.next ?? null
  const hasNext = !!nextCursor

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    resetPagination()
  }, [resetPagination])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    resetPagination()
  }, [resetPagination])

  const handleSourceChange = useCallback((value: string) => {
    setSource(value)
    resetPagination()
  }, [resetPagination])

  const handleAssignedToChange = useCallback((value: string) => {
    setAssignedTo(value)
    resetPagination()
  }, [resetPagination])

  const { exportCsv: handleExport, isExporting } = useCsvExport({
    request: () => leadsApi.export({
      status: status === 'all' ? undefined : status,
      source: source === 'all' ? undefined : source,
      search: debouncedSearch.trim() || undefined,
    }),
    filename: 'leads.csv',
    successTitle: 'Leads exported',
    successDescription: 'Your leads have been exported as CSV.',
    errorTitle: 'Export failed',
    errorDescription: 'Please try again.',
  })

  const paginationLabel =
    leads.length === 0
      ? 'No results'
      : `${pageIndex * pageSize + 1}–${pageIndex * pageSize + leads.length} of ${totalCount}`

  return (
    <div className="space-y-6">
      <LeadsHeader
        total={totalCount}
        isLoading={listBusy}
        onExport={handleExport}
        isExporting={isExporting}
        onLeadListReload={handleLeadListReload}
      />
      <LeadsStats isLoading={listBusy} />
      <LeadsTable
        leads={leads}
        isLoading={listBusy}
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        source={source}
        onSourceChange={handleSourceChange}
        assignedTo={assignedTo}
        onAssignedToChange={handleAssignedToChange}
        serverSide={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          hasNext,
          hasPrev,
          onNext: () => goNext(nextCursor),
          onPrev: goPrev,
          totalLabel: paginationLabel,
        }}
      />
    </div>
  )
}
