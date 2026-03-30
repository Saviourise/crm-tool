import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '@/api/contacts'
import { mapApiContactToContact } from './apiMappers'
import { ContactsHeader } from './components/ContactsHeader'
import { ContactsTable } from './components/ContactsTable'
import { ContactStats } from './components/ContactStats'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const CONTACTS_QUERY_KEY = ['contacts']

export default function Contacts() {
  const queryClient = useQueryClient()
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...CONTACTS_QUERY_KEY, pageSize, cursor, debouncedSearch, status],
    queryFn: () =>
      contactsApi.list({
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        status: status === 'all' ? undefined : status,
      }),
  })

  const [listReloading, setListReloading] = useState(false)
  const listBusy = isLoading || listReloading

  const handleContactListReload = useCallback(async () => {
    setListReloading(true)
    try {
      await queryClient.refetchQueries({ queryKey: CONTACTS_QUERY_KEY, exact: false })
    } finally {
      setListReloading(false)
    }
  }, [queryClient])

  const response = data?.data
  const rawResults = response?.results ?? []
  const contacts = rawResults.map(mapApiContactToContact)
  const totalCount = response?.count ?? contacts.length
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

  const paginationLabel =
    contacts.length === 0
      ? 'No results'
      : `${(cursorStack.length * pageSize) + 1}–${cursorStack.length * pageSize + contacts.length} of ${totalCount}`

  return (
    <div className="space-y-6">
      <ContactsHeader
        total={totalCount}
        isLoading={listBusy}
        onContactListReload={handleContactListReload}
      />
      <ContactStats isLoading={listBusy} />
      <ContactsTable
        contacts={contacts}
        isLoading={listBusy}
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
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
