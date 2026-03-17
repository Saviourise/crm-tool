import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/api/contacts'
import { mapApiContactToContact } from './apiMappers'
import { ContactsHeader } from './components/ContactsHeader'
import { ContactsTable } from './components/ContactsTable'
import { ContactStats } from './components/ContactStats'

const CONTACTS_QUERY_KEY = ['contacts']

export default function Contacts() {
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([])

  const { data, isLoading } = useQuery({
    queryKey: [...CONTACTS_QUERY_KEY, pageSize, cursor],
    queryFn: () => contactsApi.list({ limit: pageSize, cursor }),
  })

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

  const paginationLabel =
    contacts.length === 0
      ? 'No results'
      : `${(cursorStack.length * pageSize) + 1}–${cursorStack.length * pageSize + contacts.length} of ${totalCount}`

  return (
    <div className="space-y-6">
      <ContactsHeader total={totalCount} isLoading={isLoading} />
      <ContactStats isLoading={isLoading} />
      <ContactsTable
        contacts={contacts}
        isLoading={isLoading}
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
