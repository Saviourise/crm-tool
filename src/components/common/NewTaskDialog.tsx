import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Briefcase, Target, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { DatePicker } from './DatePicker'
import { tasksApi } from '@/api/tasks'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'
import { TASKS_STATS_QUERY_KEY } from '@/pages/tasks/queryKeys'

const RELATED_ICONS = {
  contact: User,
  lead: Target,
  deal: Briefcase,
}

const RELATED_LABELS = {
  contact: 'Contact',
  lead: 'Lead',
  deal: 'Deal',
}

interface NewTaskDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Pre-fill the related entity (e.g. when opening from a lead/contact/deal row) */
  relatedType?: 'contact' | 'lead' | 'deal'
  relatedId?: string
  relatedName?: string
}

export function NewTaskDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  relatedType,
  relatedId,
  relatedName,
}: NewTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const queryClient = useQueryClient()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const createTask = useMutation({
    mutationFn: (data: Parameters<typeof tasksApi.create>[0]) => tasksApi.create(data),
    onSuccess: () => {
      toast.success('Task created', { description: 'Your task has been added to the list.' })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.tasksDue })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: TASKS_STATS_QUERY_KEY })
      if (relatedType === 'contact' && relatedId)
        queryClient.invalidateQueries({ queryKey: ['contacts', relatedId, 'tasks'] })
      if (relatedType === 'lead' && relatedId)
        queryClient.invalidateQueries({ queryKey: ['leads', relatedId, 'tasks'] })
      if (relatedType === 'deal' && relatedId)
        queryClient.invalidateQueries({ queryKey: ['pipeline', 'deals', relatedId, 'tasks'] })
      setDueDate(undefined)
      setPriority('medium')
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to create task', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const title = (form.elements.namedItem('taskTitle') as HTMLInputElement).value.trim()
    const description = (form.elements.namedItem('taskDescription') as HTMLInputElement).value.trim() || undefined

    createTask.mutate({
      title,
      description,
      priority,
      status: 'pending',
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      related_type: relatedType,
      related_id: relatedId,
    })
    form.reset()
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setDueDate(undefined)
    setOpen(next)
  }

  const RelatedIcon = relatedType ? RELATED_ICONS[relatedType] : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Create a task to track your activities and follow-ups.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input id="taskTitle" name="taskTitle" placeholder="Follow up with client" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Input id="taskDescription" name="taskDescription" placeholder="Discuss proposal details" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDueDate">Due Date</Label>
              <DatePicker
                id="taskDueDate"
                value={dueDate}
                onChange={setDueDate}
                placeholder="Pick a due date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskPriority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger id="taskPriority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {relatedType && relatedId && relatedName && RelatedIcon && (
              <div className="grid gap-2">
                <Label>Related To</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/40 text-sm">
                  <RelatedIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mr-1">
                    {RELATED_LABELS[relatedType]}
                  </span>
                  <span className="font-medium truncate">{relatedName}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? 'Creating…' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
