import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '@/api/contacts'
import { mapApiContactToContact } from './apiMappers'
import { ContactsHeader } from './components/ContactsHeader'
import { ContactsTable } from './components/ContactsTable'
import { ContactStats } from './components/ContactStats'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCursorPagination } from '@/hooks/useCursorPagination'

const CONTACTS_QUERY_KEY = ['contacts']

export default function Contacts() {
  const queryClient = useQueryClient()
  const { pageSize, cursor, pageIndex, hasPrev, resetPagination, goNext, goPrev, handlePageSizeChange } = useCursorPagination()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [assignedTo, setAssignedTo] = useState<string>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...CONTACTS_QUERY_KEY, pageSize, cursor, debouncedSearch, status, assignedTo],
    queryFn: () =>
      contactsApi.list({
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        status: status === 'all' ? undefined : status,
        assigned_to: assignedTo === 'all' ? undefined : assignedTo,
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    resetPagination()
  }, [resetPagination])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    resetPagination()
  }, [resetPagination])

  const handleAssignedToChange = useCallback((value: string) => {
    setAssignedTo(value)
    resetPagination()
  }, [resetPagination])

  const paginationLabel =
    contacts.length === 0
      ? 'No results'
      : `${(pageIndex * pageSize) + 1}–${pageIndex * pageSize + contacts.length} of ${totalCount}`

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
