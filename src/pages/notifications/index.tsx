import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  INITIAL_NOTIFICATIONS,
  NOTIF_ICONS,
  NOTIF_COLORS,
  type AppNotification,
} from '@/components/common/NotificationsBell'

type FilterTab = 'all' | 'unread' | 'read'

const EXTRA_NOTIFICATIONS: AppNotification[] = [
  { id: '6',  type: 'deal',    title: 'Deal updated',            body: 'GlobalTech deal moved to Proposal stage.',        time: '2 days ago', read: true },
  { id: '7',  type: 'contact', title: 'Contact reassigned',      body: 'Emma Wilson assigned to James Torres.',           time: '2 days ago', read: true },
  { id: '8',  type: 'task',    title: 'Task completed',          body: 'Demo with Riverside Inc marked as complete.',     time: '3 days ago', read: true },
  { id: '9',  type: 'system',  title: 'New integration connected', body: 'Slack integration connected successfully.',        time: '4 days ago', read: true },
  { id: '10', type: 'deal',    title: 'Deal at risk',            body: 'Pinnacle LLC deal probability dropped to 15%.',   time: '5 days ago', read: true },
]

const ALL_NOTIFICATIONS: AppNotification[] = [...INITIAL_NOTIFICATIONS, ...EXTRA_NOTIFICATIONS]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(ALL_NOTIFICATIONS)
  const [filter, setFilter] = useState<FilterTab>('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all',    label: 'All' },
    { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'read',   label: 'Read' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay up to date with activity across your CRM.
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="shrink-0 gap-1.5">
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                filter === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      <div className="rounded-xl border divide-y overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No notifications here.
          </div>
        ) : (
          filtered.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type]
            return (
              <div
                key={notif.id}
                className={cn(
                  'flex items-start gap-4 px-5 py-4 transition-colors',
                  !notif.read && 'bg-primary/[0.03]'
                )}
              >
                <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0 mt-0.5', NOTIF_COLORS[notif.type])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm', !notif.read ? 'font-semibold' : 'font-medium')}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{notif.time}</p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markRead(notif.id)}
                    className="text-xs text-primary hover:text-primary/80 font-medium shrink-0 mt-1 transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
