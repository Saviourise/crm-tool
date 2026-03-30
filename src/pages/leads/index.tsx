import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsApi } from '@/api/leads'
import { mapApiLeadToLead } from './apiMappers'
import { LeadsHeader } from './components/LeadsHeader'
import { LeadsStats } from './components/LeadsStats'
import { LeadsTable } from './components/LeadsTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export const LEADS_QUERY_KEY = ['leads']

export default function Leads() {
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [source, setSource] = useState<string>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...LEADS_QUERY_KEY, pageSize, cursor, debouncedSearch, status, source],
    queryFn: () =>
      leadsApi.list({
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        status: status === 'all' ? undefined : status,
        source: source === 'all' ? undefined : source,
      }),
  })

  const response = data?.data
  const rawResults = response?.results ?? []
  const leads = rawResults.map(mapApiLeadToLead)
  const totalCount = response?.count ?? leads.length
  const nextCursor = response?.next ?? null
  const hasNext = !!nextCursor
  const hasPrev = cursorStack.length > 0

  const goNext = useCallback(() => {
    if (nextCursor) {
      setCursorStack((prev) => [...prev, cursor ?? null])
      setCursor(nextCursor)
    }
  }, [nextCursor, cursor])

  const goPrev = useCallback(() => {
    if (cursorStack.length > 0) {
      const prev = cursorStack[cursorStack.length - 1]
      setCursorStack((prevStack) => prevStack.slice(0, -1))
      setCursor(prev ?? undefined)
    }
  }, [cursorStack])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const handleSourceChange = useCallback((value: string) => {
    setSource(value)
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const handleExport = useCallback(async () => {
    try {
      const res = await leadsApi.export({
        status: status === 'all' ? undefined : status,
        source: source === 'all' ? undefined : source,
        search: debouncedSearch.trim() || undefined,
      })
      const blob = res.data as unknown as Blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'leads.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Leads exported', { description: 'Your leads have been exported as CSV.' })
    } catch {
      toast.error('Export failed', { description: 'Please try again.' })
    }
  }, [status, source, debouncedSearch])

  const paginationLabel =
    leads.length === 0
      ? 'No results'
      : `${cursorStack.length * pageSize + 1}–${cursorStack.length * pageSize + leads.length} of ${totalCount}`

  return (
    <div className="space-y-6">
      <LeadsHeader total={totalCount} isLoading={isLoading} onExport={handleExport} />
      <LeadsStats />
      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        source={source}
        onSourceChange={handleSourceChange}
        serverSide={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          hasNext,
          hasPrev,
          onNext: goNext,
          onPrev: goPrev,
          totalLabel: paginationLabel,
        }}
      />
    </div>
  )
}
