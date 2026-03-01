import { useState } from 'react'
import { Bell, Check, TrendingUp, UserPlus, CheckSquare, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/router/routes'

type NotifType = 'deal' | 'contact' | 'task' | 'system'

export interface AppNotification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: '1', type: 'deal',    title: 'Deal closed — $45,000',  body: 'TechCorp signed the enterprise contract.',          time: '2 min ago',  read: false },
  { id: '2', type: 'contact', title: 'New contact added',       body: 'John Smith was added via LinkedIn import.',        time: '18 min ago', read: false },
  { id: '3', type: 'task',    title: 'Task overdue',            body: 'Follow-up call with Acme Corp is overdue.',       time: '1 hr ago',   read: false },
  { id: '4', type: 'system',  title: 'Weekly report ready',     body: 'Your Q1 sales summary is now available.',         time: '3 hr ago',   read: true  },
  { id: '5', type: 'system',  title: 'Campaign launched',       body: '"Spring Promo" email went out to 2,400 leads.',   time: 'Yesterday',  read: true  },
]

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

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
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

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
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
          {notifications.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type]
            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => markRead(notif.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                  !notif.read && 'bg-primary/[0.03]'
                )}
              >
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
              </button>
            )
          })}
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
