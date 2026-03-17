import type { ColumnDef } from '@tanstack/react-table'
import { TrendingUp, UserPlus, CheckSquare, Zap, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/components/common/NotificationsBell'

export const NOTIF_ICONS: Record<AppNotification['type'], React.ElementType> = {
  deal: TrendingUp,
  contact: UserPlus,
  task: CheckSquare,
  system: Zap,
}

export const NOTIF_COLORS: Record<AppNotification['type'], string> = {
  deal: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  contact: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  task: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  system: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
}

const typeLabels: Record<AppNotification['type'], string> = {
  deal: 'Deal',
  contact: 'Contact',
  task: 'Task',
  system: 'System',
}

interface NotificationsTableServerSide {
  pageSize: number
  onPageSizeChange: (size: number) => void
  hasNext: boolean
  hasPrev: boolean
  onNext: () => void
  onPrev: () => void
  totalLabel?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

interface NotificationsTableProps {
  notifications: AppNotification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  isMarkAllPending: boolean
  isLoading?: boolean
  statusFilter?: 'all' | 'read' | 'unread'
  onStatusChange?: (value: 'all' | 'read' | 'unread') => void
  serverSide?: NotificationsTableServerSide
}

export function NotificationsTable({
  notifications,
  onMarkRead,
  onMarkAllRead,
  isMarkAllPending,
  isLoading,
  statusFilter = 'all',
  onStatusChange,
  serverSide,
}: NotificationsTableProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  const columns: ColumnDef<AppNotification, unknown>[] = [
    {
      id: 'type',
      accessorFn: (row) => row.type,
      header: 'Type',
      size: 100,
      filterFn: 'equals',
      cell: ({ row }) => {
        const t = row.original.type
        const Icon = NOTIF_ICONS[t]
        return (
          <div className="flex items-center gap-2">
            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', NOTIF_COLORS[t])}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{typeLabels[t]}</span>
          </div>
        )
      },
    },
    {
      id: 'title',
      accessorFn: (row) => row.title,
      header: 'Notification',
      size: 280,
      cell: ({ row }) => {
        const n = row.original
        const content = (
          <div>
            <div className="flex items-center gap-2">
              <p className={cn('text-sm', !n.read ? 'font-semibold' : 'font-medium')}>
                {n.title}
              </p>
              {!n.read && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">New</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
          </div>
        )
        return n.link ? (
          <Link to={n.link} className="block hover:text-primary transition-colors">
            {content}
          </Link>
        ) : (
          content
        )
      },
    },
    {
      id: 'time',
      accessorFn: (row) => row.time,
      header: 'When',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.time}</span>
      ),
    },
    {
      id: 'status',
      accessorFn: (row) => (row.read ? 'read' : 'unread'),
      header: 'Status',
      filterFn: 'equals',
      cell: ({ row }) => (
        <Badge
          variant={row.original.read ? 'outline' : 'secondary'}
          className={cn(
            'text-xs',
            !row.original.read && 'bg-primary/10 text-primary border-primary/20'
          )}
        >
          {row.original.read ? 'Read' : 'Unread'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 100,
      enableSorting: false,
      cell: ({ row }) =>
        !row.original.read ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onMarkRead(row.original.id)}
          >
            <Check className="h-3 w-3" />
            Mark read
          </Button>
        ) : null,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={notifications}
      searchPlaceholder="Search by title or body..."
      toolbar={(table) => (
        <>
          <Select
            value={serverSide ? statusFilter : ((table.getColumn('status')?.getFilterValue() as string | undefined) ?? 'all')}
            onValueChange={(val) => {
              if (serverSide && onStatusChange) {
                onStatusChange(val as 'all' | 'read' | 'unread')
              } else {
                table.getColumn('status')?.setFilterValue(val === 'all' ? undefined : val)
                table.setPageIndex(0)
              }
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              disabled={isMarkAllPending}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </>
      )}
      emptyMessage="No notifications"
      emptyDescription="You're all caught up. New notifications will appear here."
      defaultPageSize={10}
      isLoading={isLoading}
      serverSide={serverSide}
    />
  )
}
