import type { ColumnDef } from '@tanstack/react-table'
import { UserPlus, Users, CheckSquare, DollarSign } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'

export type ActivityDisplayType = 'lead' | 'contact' | 'task' | 'deal'

export interface ActivityRow {
  id: string
  type: string
  entity_type: string
  displayType: ActivityDisplayType
  title: string
  description: string
  timestamp: string
  user: string
  logged_at: string
}

export const activityIcons: Record<ActivityDisplayType, React.ElementType> = {
  lead: UserPlus,
  contact: Users,
  task: CheckSquare,
  deal: DollarSign,
}

export const activityColors: Record<ActivityDisplayType, string> = {
  lead: 'bg-primary/10 text-primary',
  contact: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  task: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  deal: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
}

const typeLabels: Record<ActivityDisplayType, string> = {
  lead: 'Lead',
  contact: 'Contact',
  task: 'Task',
  deal: 'Deal',
}

const columns: ColumnDef<ActivityRow, unknown>[] = [
  {
    id: 'type',
    accessorFn: (row) => row.displayType,
    header: 'Type',
    size: 100,
    filterFn: 'equals',
    cell: ({ row }) => {
      const t = row.original.displayType
      const Icon = activityIcons[t]
      return (
        <div className="flex items-center gap-2">
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', activityColors[t])}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium capitalize">{typeLabels[t]}</span>
        </div>
      )
    },
  },
  {
    id: 'title',
    accessorFn: (row) => row.title,
    header: 'Activity',
    size: 200,
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.title}</p>
        {row.original.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{row.original.description}</p>
        )}
      </div>
    ),
  },
  {
    id: 'user',
    accessorFn: (row) => row.user,
    header: 'Actor',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs">
            {row.original.user
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">{row.original.user}</span>
      </div>
    ),
  },
  {
    id: 'timestamp',
    accessorFn: (row) => row.logged_at,
    header: 'When',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.timestamp}</span>
    ),
  },
]

interface ActivityTableProps {
  activities: ActivityRow[]
  isLoading?: boolean
}

export function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={activities}
      searchPlaceholder="Search by activity, description..."
      toolbar={(table) => (
        <Select
          value={(table.getColumn('type')?.getFilterValue() as ActivityDisplayType | undefined) ?? 'all'}
          onValueChange={(val) => {
            table.getColumn('type')?.setFilterValue(val === 'all' ? undefined : val)
            table.setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.keys(typeLabels) as ActivityDisplayType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {typeLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      emptyMessage="No activity yet"
      emptyDescription="Activity will appear here as you create leads, contacts, and deals."
      defaultPageSize={20}
    />
  )
}
