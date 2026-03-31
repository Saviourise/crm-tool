import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import type { AppNotification } from '@/components/common/NotificationsBell'
import { notificationsApi } from '@/api/notifications'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { NotificationsHeader } from './components/NotificationsHeader'
import { NotificationsTable } from './components/NotificationsTable'
import { parseNextCursor } from '@/lib/pagination'

const NOTIFICATIONS_QUERY_KEY = ['notifications']

function mapNotifType(apiType: string): AppNotification['type'] {
  const t = apiType?.toLowerCase() ?? ''
  if (t.includes('deal') || t.includes('stage')) return 'deal'
  if (t.includes('lead') || t.includes('contact')) return 'contact'
  if (t.includes('task')) return 'task'
  return 'system'
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { pageSize, cursor, pageIndex, hasPrev, resetPagination, goNext, goPrev, handlePageSizeChange } = useCursorPagination()
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    resetPagination()
  }, [resetPagination])

  const handleStatusChange = useCallback((value: 'all' | 'read' | 'unread') => {
    setStatusFilter(value)
    resetPagination()
  }, [resetPagination])

  const startRow = pageIndex * pageSize + 1
  const endRow = pageIndex * pageSize + notifications.length
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
          onNext: () => goNext(nextCursor),
          onPrev: goPrev,
          totalLabel: paginationLabel,
          searchValue: search,
          onSearchChange: handleSearchChange,
        }}
      />
    </div>
  )
}
