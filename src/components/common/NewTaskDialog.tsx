import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { DatePicker } from './DatePicker'
import { tasksApi } from '@/api/crm'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'

interface NewTaskDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewTaskDialog({ trigger, open: controlledOpen, onOpenChange }: NewTaskDialogProps) {
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
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
      due_date: dueDate ? dueDate.toISOString() : undefined,
    })
    form.reset()
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setDueDate(undefined)
    setOpen(next)
  }

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
