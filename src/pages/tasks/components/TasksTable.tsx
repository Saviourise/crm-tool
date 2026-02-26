import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  RotateCcw,
  Clock,
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
import { DatePicker } from '@/components/common/DatePicker'
import { cn } from '@/lib/utils'
import type { Task, TaskPriority, TaskStatus } from '../typings'
import { PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_ICONS, isOverdue } from '../utils'
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../data'

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
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Task updated', { description: `"${task.title}" has been updated.` })
    onOpenChange(false)
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
              <Input id="edit-title" defaultValue={task.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input id="edit-desc" defaultValue={task.description ?? ''} placeholder="Optional details" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select defaultValue={task.priority}>
                  <SelectTrigger id="edit-priority">
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
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={task.status}>
                  <SelectTrigger id="edit-status">
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
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Pick a date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-assigned">Assigned To</Label>
                <Input id="edit-assigned" defaultValue={task.assignedTo} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              toast.error('Task deleted', { description: `"${task.title}" has been removed.` })
              onOpenChange(false)
            }}
          >
            Delete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function TaskRowActions({
  task,
  onToggleComplete,
}: {
  task: Task
  onToggleComplete: (id: string) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isDone = task.status === 'completed'

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={isDone ? 'Mark as to do' : 'Mark as complete'}
          onClick={() => onToggleComplete(task.id)}
        >
          {isDone ? (
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(var(--success))]" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onToggleComplete(task.id)
              }}
            >
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
            <DropdownMenuItem
              onClick={() => toast.info('Activity logged', { description: `Activity logged for "${task.title}".` })}
            >
              <Clock className="h-4 w-4 mr-2" />
              Log Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteTaskDialog task={task} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

function buildColumns(
  onToggleComplete: (id: string) => void,
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
      accessorFn: (row) => `${row.title} ${row.description ?? ''} ${row.relatedTo?.name ?? ''}`,
      header: 'Task',
      size: 380,
      cell: ({ row }) => {
        const task = row.original
        const overdue = isOverdue(task.dueDate, task.status)
        const done = task.status === 'completed'
        return (
          <div className="flex items-start gap-2.5">
            <span className="text-base mt-0.5 shrink-0">{CATEGORY_ICONS[task.category]}</span>
            <div className="min-w-0">
              <p className={cn('text-sm font-medium leading-snug', done && 'line-through text-muted-foreground')}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
              )}
              {task.relatedTo && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {task.relatedTo.type === 'deal' ? '💼' : task.relatedTo.type === 'lead' ? '🎯' : '👤'}{' '}
                  {task.relatedTo.name}
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
      filterFn: 'equals',
      size: 110,
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
      filterFn: 'equals',
      size: 120,
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status]
        const done = row.original.status === 'completed'
        return (
          <div className="flex items-center gap-1.5">
            {done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(var(--success))] shrink-0" />
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
        return (
          <span className={cn('text-sm tabular-nums', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
            {dueDate}
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
        <span className="text-sm text-muted-foreground">{row.original.assignedTo}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      enableSorting: false,
      cell: ({ row }) => (
        <TaskRowActions task={row.original} onToggleComplete={onToggleComplete} />
      ),
    },
  ]
}

// ─── Bulk Actions Bar ─────────────────────────────────────────────────────────

function BulkActionsBar({
  count,
  onComplete,
  onMarkTodo,
  onDelete,
  onClear,
}: {
  count: number
  onComplete: () => void
  onMarkTodo: () => void
  onDelete: () => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-foreground text-background animate-in slide-in-from-top-2 duration-200">
      <span className="text-sm font-medium tabular-nums shrink-0">
        {count} task{count !== 1 ? 's' : ''} selected
      </span>

      <div className="h-4 w-px bg-background/20" />

      <div className="flex items-center gap-1.5 flex-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-background hover:text-background hover:bg-background/15 gap-1.5"
          onClick={onComplete}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark Complete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-background hover:text-background hover:bg-background/15 gap-1.5"
          onClick={onMarkTodo}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reopen
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-background/80 hover:text-red-400 hover:bg-background/15 gap-1.5"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-background/60 hover:text-background hover:bg-background/15 shrink-0"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ─── Main TasksTable ──────────────────────────────────────────────────────────

export function TasksTable({
  tasks,
  onToggleComplete,
  onBulkAction,
}: {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onBulkAction: (ids: string[], action: 'complete' | 'todo' | 'delete') => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  const handleBulk = (action: 'complete' | 'todo' | 'delete') => {
    onBulkAction(Array.from(selectedIds), action)
    clearSelection()
  }

  const columns = buildColumns(onToggleComplete, selectedIds, handleSelectAll, handleSelectRow)

  return (
    <div className="space-y-2">
      {selectedIds.size > 0 && (
        <BulkActionsBar
          count={selectedIds.size}
          onComplete={() => handleBulk('complete')}
          onMarkTodo={() => handleBulk('todo')}
          onDelete={() => handleBulk('delete')}
          onClear={clearSelection}
        />
      )}

      <DataTable
        columns={columns}
        data={tasks}
        searchPlaceholder="Search tasks..."
        toolbar={(table) => (
          <>
            <Select
              value={(table.getColumn('status')?.getFilterValue() as TaskStatus | undefined) ?? 'all'}
              onValueChange={(val) => {
                table.getColumn('status')?.setFilterValue(val === 'all' ? undefined : val)
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={(table.getColumn('priority')?.getFilterValue() as TaskPriority | undefined) ?? 'all'}
              onValueChange={(val) => {
                table.getColumn('priority')?.setFilterValue(val === 'all' ? undefined : val)
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        emptyMessage="No tasks found"
        emptyDescription="Try adjusting your search or filters, or create a new task."
      />
    </div>
  )
}
