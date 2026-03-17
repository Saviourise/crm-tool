import type { ColumnDef } from '@tanstack/react-table'
import { UserPlus, Users, CheckSquare, DollarSign, Building2 } from 'lucide-react'
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
import type { ApiWorkspaceMember } from '@/api/types'

export type ActivityDisplayType = 'lead' | 'contact' | 'task' | 'deal' | 'company'

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
  company: Building2,
}

export const activityColors: Record<ActivityDisplayType, string> = {
  lead: 'bg-primary/10 text-primary',
  contact: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  task: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  deal: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
  company: 'bg-slate-100 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400',
}

const typeLabels: Record<ActivityDisplayType, string> = {
  lead: 'Lead',
  contact: 'Contact',
  task: 'Task',
  deal: 'Deal',
  company: 'Company',
}

/** API activity type values for ?type= filter */
const ACTIVITY_TYPE_OPTIONS = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task_completed', label: 'Task completed' },
  { value: 'deal_stage_changed', label: 'Deal stage changed' },
  { value: 'lead_converted', label: 'Lead converted' },
  { value: 'contact_created', label: 'Contact created' },
  { value: 'import', label: 'Import' },
  { value: 'export', label: 'Export' },
  { value: 'login', label: 'Login' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
] as const

const columns: ColumnDef<ActivityRow, unknown>[] = [
  {
    id: 'type',
    accessorFn: (row) => row.displayType,
    header: 'Type',
    size: 200,
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
    size: 300,
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

interface ActivityTableServerSide {
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

interface ActivityTableProps {
  activities: ActivityRow[]
  isLoading?: boolean
  entityType?: ActivityDisplayType | 'all'
  onEntityTypeChange?: (value: ActivityDisplayType | 'all') => void
  activityType?: string
  onActivityTypeChange?: (value: string) => void
  actorId?: string
  onActorIdChange?: (value: string) => void
  users?: ApiWorkspaceMember[]
  serverSide?: ActivityTableServerSide
}

export function ActivityTable({
  activities,
  isLoading,
  entityType = 'all',
  onEntityTypeChange,
  activityType = 'all',
  onActivityTypeChange,
  actorId = 'all',
  onActorIdChange,
  users = [],
  serverSide,
}: ActivityTableProps) {
  return (
    <DataTable
      columns={columns}
      data={activities}
      searchPlaceholder="Search by activity, description..."
      toolbar={(table) => (
        <div className="flex flex-wrap items-center gap-2">
          {/* entity_type */}
          <Select
            value={serverSide ? entityType : ((table.getColumn('type')?.getFilterValue() as ActivityDisplayType | undefined) ?? 'all')}
            onValueChange={(val) => {
              if (serverSide && onEntityTypeChange) {
                onEntityTypeChange(val as ActivityDisplayType | 'all')
              } else {
                table.getColumn('type')?.setFilterValue(val === 'all' ? undefined : val)
                table.setPageIndex(0)
              }
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {(Object.keys(typeLabels) as ActivityDisplayType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {typeLabels[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* type (activity type) */}
          <Select
            value={serverSide ? activityType : 'all'}
            onValueChange={(val) => {
              if (serverSide && onActivityTypeChange) onActivityTypeChange(val)
              else if (!serverSide) table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* actor */}
          <Select
            value={serverSide ? actorId : 'all'}
            onValueChange={(val) => {
              if (serverSide && onActorIdChange) onActorIdChange(val)
              else if (!serverSide) table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((m) => (
                <SelectItem key={m.id} value={m.user.id}>
                  {m.user.name || m.user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      emptyMessage="No activity yet"
      emptyDescription="Activity will appear here as you create leads, contacts, and deals."
      defaultPageSize={10}
      isLoading={isLoading}
      serverSide={serverSide}
    />
  )
}
