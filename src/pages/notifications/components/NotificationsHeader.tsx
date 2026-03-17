import { Bell } from 'lucide-react'

interface NotificationsHeaderProps {
  total: number
  unreadCount: number
}

export function NotificationsHeader({ total, unreadCount }: NotificationsHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
        <Bell className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          {total} notification{total !== 1 ? 's' : ''}
          {unreadCount > 0 && (
            <span className="text-primary font-medium"> · {unreadCount} unread</span>
          )}
        </p>
      </div>
    </div>
  )
}
