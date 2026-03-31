import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/api/companies'
import { mapApiCompanyToCompany } from './apiMappers'
import { CompanyHeader } from './components/CompanyHeader'
import { CompanyStats } from './components/CompanyStats'
import { CompaniesTable } from './components/CompaniesTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCursorPagination } from '@/hooks/useCursorPagination'

const COMPANIES_QUERY_KEY = ['companies']

export default function Companies() {
  const queryClient = useQueryClient()
  const { pageSize, cursor, pageIndex, hasPrev, resetPagination, goNext, goPrev, handlePageSizeChange } = useCursorPagination()
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    resetPagination()
  }, [resetPagination])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    resetPagination()
  }, [resetPagination])

  const handleIndustryChange = useCallback((value: string) => {
    setIndustry(value)
    resetPagination()
  }, [resetPagination])

  const paginationLabel =
    companies.length === 0
      ? 'No results'
      : `${(pageIndex * pageSize) + 1}–${pageIndex * pageSize + companies.length} of ${totalCount}`

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
          onNext: () => goNext(nextCursor),
          onPrev: goPrev,
          totalLabel: paginationLabel,
        }}
      />
    </div>
  )
}
