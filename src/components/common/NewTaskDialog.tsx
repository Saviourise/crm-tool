import { useState } from 'react'
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

interface NewTaskDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewTaskDialog({ trigger, open: controlledOpen, onOpenChange }: NewTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Task created', { description: 'Your task has been added to the list.' })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Input id="taskTitle" placeholder="Follow up with client" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Input id="taskDescription" placeholder="Discuss proposal details" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDueDate">Due Date</Label>
              <Input id="taskDueDate" type="datetime-local" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskPriority">Priority</Label>
              <select
                id="taskPriority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
