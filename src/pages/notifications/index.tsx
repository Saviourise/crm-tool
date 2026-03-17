import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import type { AppNotification } from '@/components/common/NotificationsBell'
import { notificationsApi } from '@/api/notifications'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { NotificationsHeader } from './components/NotificationsHeader'
import { NotificationsTable } from './components/NotificationsTable'

const NOTIFICATIONS_QUERY_KEY = ['notifications']

function parseNextCursor(next: string | null | undefined): string | null {
  if (!next) return null
  try {
    if (next.startsWith('http')) {
      const u = new URL(next)
      return u.searchParams.get('cursor') ?? next
    }
    return next
  } catch {
    return next
  }
}

function mapNotifType(apiType: string): AppNotification['type'] {
  const t = apiType?.toLowerCase() ?? ''
  if (t.includes('deal') || t.includes('stage')) return 'deal'
  if (t.includes('lead') || t.includes('contact')) return 'contact'
  if (t.includes('task')) return 'task'
  return 'system'
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, pageSize, cursor, debouncedSearch, statusFilter],
    queryFn: () =>
      notificationsApi.list({
        page_size: pageSize,
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        is_read: statusFilter === 'all' ? undefined : statusFilter === 'read',
      }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })

  const notifications: AppNotification[] =
    data?.data?.results?.map((n) => ({
      id: n.id,
      type: mapNotifType(n.type),
      title: n.title,
      body: n.body,
      time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
      read: n.is_read,
      link: n.link,
    })) ?? []

  const response = data?.data
  const totalCount = response?.count ?? notifications.length
  const unreadCount = response?.unread_count ?? notifications.filter((n) => !n.read).length
  const nextCursor = parseNextCursor(response?.next ?? null)
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

  const handleStatusChange = useCallback((value: 'all' | 'read' | 'unread') => {
    setStatusFilter(value)
    setCursor(undefined)
    setCursorStack([])
  }, [])

  const startRow = cursorStack.length * pageSize + 1
  const endRow = cursorStack.length * pageSize + notifications.length
  const paginationLabel =
    notifications.length === 0
      ? 'No results'
      : hasNext
        ? `${startRow}–${endRow}+`
        : `${startRow}–${endRow} of ${totalCount}`

  return (
    <div className="space-y-6">
      <NotificationsHeader total={totalCount} unreadCount={unreadCount} />
      <NotificationsTable
        notifications={notifications}
        onMarkRead={(id) => markReadMutation.mutate(id)}
        onMarkAllRead={() => markAllReadMutation.mutate()}
        isMarkAllPending={markAllReadMutation.isPending}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        serverSide={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          hasNext,
          hasPrev,
          onNext: goNext,
          onPrev: goPrev,
          totalLabel: paginationLabel,
          searchValue: search,
          onSearchChange: handleSearchChange,
        }}
      />
    </div>
  )
}
