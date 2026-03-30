import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/api/companies'
import { mapApiCompanyToCompany } from './apiMappers'
import { CompanyHeader } from './components/CompanyHeader'
import { CompanyStats } from './components/CompanyStats'
import { CompaniesTable } from './components/CompaniesTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const COMPANIES_QUERY_KEY = ['companies']

export default function Companies() {
  const queryClient = useQueryClient()
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [industry, setIndustry] = useState<string>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...COMPANIES_QUERY_KEY, pageSize, cursor, debouncedSearch, status, industry],
    queryFn: () =>
      companiesApi.list({
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        status: status === 'all' ? undefined : status,
        industry: industry === 'all' ? undefined : industry,
      }),
  })

  const [listReloading, setListReloading] = useState(false)
  const listBusy = isLoading || listReloading

  const handleCompanyListReload = useCallback(async () => {
    setListReloading(true)
    try {
      await queryClient.refetchQueries({ queryKey: COMPANIES_QUERY_KEY, exact: false })
    } finally {
      setListReloading(false)
    }
  }, [queryClient])

  const response = data?.data
  const rawResults = response?.results ?? []
  const companies = rawResults.map(mapApiCompanyToCompany)
  const totalCount = response?.count ?? companies.length
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

  const handleIndustryChange = useCallback((value: string) => {
    setIndustry(value)
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const paginationLabel =
    companies.length === 0
      ? 'No results'
      : `${(cursorStack.length * pageSize) + 1}–${cursorStack.length * pageSize + companies.length} of ${totalCount}`

  return (
    <div className="space-y-6">
      <CompanyHeader
        total={totalCount}
        isLoading={listBusy}
        onCompanyListReload={handleCompanyListReload}
      />
      <CompanyStats isLoading={listBusy} />
      <CompaniesTable
        companies={companies}
        isLoading={listBusy}
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        industry={industry}
        onIndustryChange={handleIndustryChange}
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
