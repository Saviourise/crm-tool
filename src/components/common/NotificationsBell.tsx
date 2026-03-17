import { useState } from 'react'
import { Bell, Check, TrendingUp, UserPlus, CheckSquare, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/router/routes'
import { notificationsApi } from '@/api/notifications'

export type NotifType = 'deal' | 'contact' | 'task' | 'system'

export interface AppNotification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  link?: string | null
}

/** Map API type to UI type */
function mapNotifType(apiType: string): NotifType {
  const t = apiType?.toLowerCase() ?? ''
  if (t.includes('deal') || t.includes('stage')) return 'deal'
  if (t.includes('lead') || t.includes('contact')) return 'contact'
  if (t.includes('task')) return 'task'
  return 'system'
}

export const NOTIF_ICONS: Record<NotifType, React.ElementType> = {
  deal:    TrendingUp,
  contact: UserPlus,
  task:    CheckSquare,
  system:  Zap,
}

export const NOTIF_COLORS: Record<NotifType, string> = {
  deal:    'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  contact: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  task:    'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  system:  'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
}

const NOTIFICATIONS_QUERY_KEY = ['notifications']

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
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

  function markAllRead() {
    markAllReadMutation.mutate()
  }

  function markRead(id: string) {
    markReadMutation.mutate(id)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(320px,calc(100vw-1rem))] p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y">
          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
          notifications.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type]
            const content = (
              <>
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', NOTIF_COLORS[notif.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn('text-sm truncate', !notif.read ? 'font-semibold' : 'font-medium')}>
                      {notif.title}
                    </p>
                    {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.body}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{notif.time}</p>
                </div>
              </>
            )
            const className = cn(
              'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
              !notif.read && 'bg-primary/[0.03]'
            )
            const onClick = () => {
              markRead(notif.id)
              if (notif.link) setOpen(false)
            }
            return notif.link ? (
              <Link key={notif.id} to={notif.link} className={className} onClick={onClick}>
                {content}
              </Link>
            ) : (
              <button key={notif.id} type="button" className={className} onClick={onClick}>
                {content}
              </button>
            )
          })
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2.5">
          <Link
            to={ROUTES.NOTIFICATIONS}
            onClick={() => setOpen(false)}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors w-full text-center block"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
