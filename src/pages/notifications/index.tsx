import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  type AppNotification,
} from '@/components/common/NotificationsBell'
import { notificationsApi } from '@/api/notifications'
import { NotificationsHeader } from './components/NotificationsHeader'
import { NotificationsTable } from './components/NotificationsTable'

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

  const { data, isLoading } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationsApi.list(),
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

  const unreadCount = data?.data?.unread_count ?? notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <NotificationsHeader total={notifications.length} unreadCount={unreadCount} />
      <NotificationsTable
        notifications={notifications}
        onMarkRead={(id) => markReadMutation.mutate(id)}
        onMarkAllRead={() => markAllReadMutation.mutate()}
        isMarkAllPending={markAllReadMutation.isPending}
        isLoading={isLoading}
      />
    </div>
  )
}
