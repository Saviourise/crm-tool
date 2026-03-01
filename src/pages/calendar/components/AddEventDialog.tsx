import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { EventType } from '../typings'

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo' },
]

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
]

export function AddEventDialog({ open, onOpenChange }: AddEventDialogProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('meeting')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [assignee, setAssignee] = useState('')
  const [linkedContact, setLinkedContact] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date || !startTime) {
      toast.error('Missing fields', { description: 'Please fill in title, date, and start time.' })
      return
    }
    toast.success('Event created', { description: `"${title}" has been added to your calendar.` })
    // Reset form
    setTitle('')
    setType('meeting')
    setDate('')
    setStartTime('')
    setDuration('60')
    setAssignee('')
    setLinkedContact('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                <SelectTrigger id="event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-time">Start Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="event-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-assignee">Assignee</Label>
              <Input
                id="event-assignee"
                placeholder="e.g. Sarah K."
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-contact">Linked Contact</Label>
              <Input
                id="event-contact"
                placeholder="e.g. Sarah Johnson"
                value={linkedContact}
                onChange={(e) => setLinkedContact(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-description">Description</Label>
              <textarea
                id="event-description"
                placeholder="Optional notes or description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
