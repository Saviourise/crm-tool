import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  RotateCcw,
  Clock,
  Briefcase,
  Target,
  User,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { BulkSelectionBar } from '@/components/common/BulkSelectionBar'
import { BulkDeleteConfirmDialog } from '@/components/common/BulkDeleteConfirmDialog'
import { DatePicker } from '@/components/common/DatePicker'
import { LogActivityDialog } from '@/components/common/LogActivityDialog'
import { cn } from '@/lib/utils'
import { tasksApi } from '@/api/tasks'
import { patchTasksListCaches } from '@/lib/listQueryCache'
import { ROUTES } from '@/router/routes'
import { useWorkspaceUsers } from '@/hooks/useWorkspaceUsers'
import { useAuth } from '@/auth/context'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'
import type { Task, TaskPriority, TaskStatus } from '../typings'
import { PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_ICONS, isOverdue } from '../utils'
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../data'
import { TASKS_QUERY_KEY, TASKS_STATS_QUERY_KEY } from '../queryKeys'
import { FRONTEND_TO_API_STATUS } from '../apiMappers'

// ─── Cache invalidation hook ──────────────────────────────────────────────────

function useTaskInvalidation() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: TASKS_QUERY_KEY, exact: false })
    qc.invalidateQueries({ queryKey: TASKS_STATS_QUERY_KEY })
    qc.invalidateQueries({ queryKey: dashboardQueryKeys.tasksDue })
  }, [qc])
}

// ─── Edit Task Dialog ─────────────────────────────────────────────────────────

function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const invalidate = useTaskInvalidation()
  const { users } = useWorkspaceUsers()

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? parseISO(task.dueDate) : undefined
  )
  const [assignedToId, setAssignedToId] = useState<string>(task.assignedToId ?? 'unassigned')
  const [relatedTo, setRelatedTo] = useState(task.relatedTo ?? null)

  const { mutate: update, isPending } = useMutation({
    mutationFn: () =>
      tasksApi.update(task.id, {
        title,
        description: description.trim() || undefined,
        priority,
        status: FRONTEND_TO_API_STATUS[status],
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        assigned_to: assignedToId === 'unassigned' ? null : assignedToId,
        related_type: relatedTo?.type,
        related_id: relatedTo?.id,
      }),
    onSuccess: (res) => {
      patchTasksListCaches(queryClient, task.id, res.data)
      toast.success('Task updated', { description: `"${title}" has been updated.` })
      invalidate()
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to update task'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the details for this task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITY_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <DatePicker value={dueDate} onChange={setDueDate} placeholder="Pick a date" />
              </div>
              <div className="grid gap-2">
                <Label>Assigned To</Label>
                <Select value={assignedToId} onValueChange={setAssignedToId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {relatedTo && (
              <div className="grid gap-2">
                <Label>Related To</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/40 text-sm">
                  {relatedTo.type === 'deal' ? (
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : relatedTo.type === 'lead' ? (
                    <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground font-medium tracking-wide mr-1 capitalize">
                    {relatedTo.type}
                  </span>
                  <span className="font-medium truncate flex-1">{relatedTo.name}</span>
                  <button
                    type="button"
                    onClick={() => setRelatedTo(null)}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    title="Remove link"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Task Dialog ───────────────────────────────────────────────────────

function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const invalidate = useTaskInvalidation()

  const { mutate: del, isPending } = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      toast.success('Task deleted', { description: `"${task.title}" has been removed.` })
      invalidate()
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to delete task'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{task.title}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => del()} disabled={isPending}>
            {isPending ? 'Deleting…' : 'Delete Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function TaskRowActions({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = useTaskInvalidation()

  const canEdit = can('tasks.edit')
  const canDelete = can('tasks.delete')
  const hasWriteAccess = canEdit || canDelete

  const isDone = task.status === 'completed'

  const { mutate: toggleComplete, isPending: isToggling } = useMutation({
    mutationFn: () =>
      tasksApi.update(task.id, {
        status: isDone ? FRONTEND_TO_API_STATUS['todo'] : FRONTEND_TO_API_STATUS['completed'],
      }),
    onSuccess: (res) => {
      patchTasksListCaches(queryClient, task.id, res.data)
      toast.success(isDone ? 'Task reopened' : 'Task completed')
      invalidate()
    },
    onError: () => toast.error('Failed to update task'),
  })

  return (
    <>
      <div className="flex items-center gap-1">
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={isDone ? 'Reopen task' : 'Mark as complete'}
            onClick={() => toggleComplete()}
            disabled={isToggling}
          >
            {isDone ? (
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            )}
          </Button>
        )}
        {hasWriteAccess && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleComplete()} disabled={isToggling}>
                    {isDone ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reopen Task
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => setLogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Log Activity
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteTaskDialog task={task} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <LogActivityDialog open={logOpen} onOpenChange={setLogOpen} entityName={task.title} />
    </>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

function buildColumns(
  selectedIds: Set<string>,
  onSelectAll: (checked: boolean) => void,
  onSelectRow: (id: string, checked: boolean) => void,
): ColumnDef<Task, unknown>[] {
  return [
    {
      id: 'select',
      size: 40,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.every((r) => selectedIds.has(r.original.id))
          }
          onCheckedChange={(v) => onSelectAll(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={(v) => onSelectRow(row.original.id, !!v)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'title',
      accessorFn: (row) => row.title,
      header: 'Task',
      size: 280,
      cell: ({ row }) => {
        const task = row.original
        const overdue = isOverdue(task.dueDate, task.status)
        const done = task.status === 'completed'
        const CategoryIcon = CATEGORY_ICONS[task.category]
        const RelatedIcon = task.relatedTo
          ? task.relatedTo.type === 'deal' ? Briefcase : task.relatedTo.type === 'lead' ? Target : User
          : null
        return (
          <div className="flex items-start gap-2.5 max-w-[600px]">
            <CategoryIcon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className={cn('text-sm font-medium leading-snug wrap-break-word text-wrap', done && 'line-through text-muted-foreground')}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 wrap-break-word text-wrap">{task.description}</p>
              )}
              {task.relatedTo && RelatedIcon && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                  <RelatedIcon className="h-3 w-3 shrink-0" />
                  <Link
                    to={
                      task.relatedTo.type === 'contact'
                        ? ROUTES.CONTACT_DETAIL(task.relatedTo.id)
                        : task.relatedTo.type === 'lead'
                          ? ROUTES.LEAD_DETAIL(task.relatedTo.id)
                          : ROUTES.DEAL_DETAIL(task.relatedTo.id)
                    }
                    className="hover:text-foreground hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.relatedTo.name}
                  </Link>
                </p>
              )}
              {overdue && (
                <span className="inline-flex items-center gap-1 text-[11px] text-destructive font-medium mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
                  Overdue
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      size: 110,
      enableSorting: false,
      cell: ({ row }) => {
        const cfg = PRIORITY_CONFIG[row.original.priority]
        return (
          <Badge variant="outline" className={cn('text-xs font-medium gap-1.5', cfg.className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      enableSorting: false,
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status]
        const done = row.original.status === 'completed'
        return (
          <div className="flex items-center gap-1.5">
            {done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
            ) : row.original.status === 'in-progress' ? (
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <Badge variant="outline" className={cn('text-xs font-medium', cfg.className)}>
              {cfg.label}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'dueDate',
      accessorFn: (row) => row.dueDate ?? '',
      header: 'Due Date',
      size: 130,
      cell: ({ row }) => {
        const { dueDate, status } = row.original
        const overdue = isOverdue(dueDate, status)
        if (!dueDate) return <span className="text-sm text-muted-foreground">—</span>
        let formatted = dueDate
        try { formatted = format(parseISO(dueDate), 'MMM d, yyyy') } catch { /* non-ISO fallback */ }
        return (
          <span className={cn('text-sm tabular-nums', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
            {formatted}
          </span>
        )
      },
    },
    {
      id: 'assignedTo',
      accessorFn: (row) => row.assignedTo,
      header: 'Assigned To',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.assignedTo || '—'}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      enableSorting: false,
      cell: ({ row }) => <TaskRowActions task={row.original} />,
    },
  ]
}

// ─── Main TasksTable ──────────────────────────────────────────────────────────

interface TasksTableProps {
  tasks: Task[]
  isLoading: boolean
  search: string
  onSearchChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
  priority: string
  onPriorityChange: (v: string) => void
  assignedTo: string
  onAssignedToChange: (v: string) => void
  serverSide: {
    pageSize: number
    onPageSizeChange: (size: number) => void
    hasNext: boolean
    hasPrev: boolean
    onNext: () => void
    onPrev: () => void
    totalLabel: string
  }
}

export function TasksTable({
  tasks,
  isLoading,
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assignedTo,
  onAssignedToChange,
  serverSide,
}: TasksTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const { can } = useAuth()
  const { users } = useWorkspaceUsers()
  const invalidate = useTaskInvalidation()

  const canEdit = can('tasks.edit')
  const canDelete = can('tasks.delete')

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(tasks.map((t) => t.id)) : new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const { mutate: bulkDelete, isPending: isBulkDeleting } = useMutation({
    mutationFn: () => tasksApi.bulkDelete(Array.from(selectedIds)),
    onSuccess: () => {
      toast.success(`${selectedIds.size} task${selectedIds.size !== 1 ? 's' : ''} deleted`)
      invalidate()
      clearSelection()
      setBulkDeleteOpen(false)
    },
    onError: () => toast.error('Failed to delete tasks'),
  })

  const { mutate: bulkUpdateStatus, isPending: isBulkUpdating } = useMutation({
    mutationFn: (newStatus: TaskStatus) =>
      Promise.allSettled(
        Array.from(selectedIds).map((id) =>
          tasksApi.update(id, { status: FRONTEND_TO_API_STATUS[newStatus] })
        )
      ),
    onSuccess: () => {
      toast.success(`${selectedIds.size} task${selectedIds.size !== 1 ? 's' : ''} updated`)
      invalidate()
      clearSelection()
    },
    onError: () => toast.error('Failed to update tasks'),
  })

  const columns = buildColumns(selectedIds, handleSelectAll, handleSelectRow)

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-2">
      {selectedCount > 0 && (canEdit || canDelete) && (
        <BulkSelectionBar
          count={selectedCount}
          label={`task${selectedCount !== 1 ? 's' : ''}`}
          onClear={clearSelection}
        >
          <div className="flex items-center gap-1.5 flex-1">
            {canEdit && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/15 gap-1.5"
                  onClick={() => bulkUpdateStatus('completed')}
                  disabled={isBulkUpdating}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/15 gap-1.5"
                  onClick={() => bulkUpdateStatus('todo')}
                  disabled={isBulkUpdating}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reopen
                </Button>
              </>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/15 gap-1.5"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={isBulkDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </BulkSelectionBar>
      )}

      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        searchPlaceholder="Search tasks..."
        serverSide={{
          ...serverSide,
          searchValue: search,
          onSearchChange,
        }}
        toolbar={() => (
          <>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={onPriorityChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={assignedTo} onValueChange={onAssignedToChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        emptyMessage="No tasks found"
        emptyDescription="Try adjusting your search or filters, or create a new task."
      />

      <BulkDeleteConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selectedCount}
        entityLabel={`task${selectedCount !== 1 ? 's' : ''}`}
        onConfirm={() => bulkDelete()}
        isDeleting={isBulkDeleting}
      />
    </div>
  )
}
