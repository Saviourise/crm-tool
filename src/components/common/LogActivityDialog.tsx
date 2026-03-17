import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Mail, Users, FileText, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { contactsApi } from '@/api/contacts'

type ActivityType = 'call' | 'email' | 'meeting' | 'note'

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: React.ElementType }[] = [
  { value: 'call',    label: 'Call',    icon: Phone },
  { value: 'email',  label: 'Email',   icon: Mail },
  { value: 'meeting',label: 'Meeting', icon: Users },
  { value: 'note',   label: 'Note',    icon: FileText },
]

interface LogActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  /** When provided, logs activity via API. Required for contacts. */
  contactId?: string
}

export function LogActivityDialog({ open, onOpenChange, entityName, contactId }: LogActivityDialogProps) {
  const [type, setType] = useState<ActivityType>('call')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const queryClient = useQueryClient()

  const logActivity = useMutation({
    mutationFn: (data: Parameters<typeof contactsApi.logActivity>[1]) =>
      contactsApi.logActivity(contactId!, data),
    onSuccess: (_, variables) => {
      const label = ACTIVITY_TYPES.find((a) => a.value === variables.type)?.label ?? variables.type
      toast.success('Activity logged', {
        description: `${label} logged for ${entityName}.`,
      })
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId, 'activity'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      handleClose()
    },
    onError: () => {
      toast.error('Failed to log activity', { description: 'Please try again.' })
    },
  })

  const handleClose = () => {
    setType('call')
    setNotes('')
    setDuration('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (contactId) {
      const summary = notes.trim() || undefined
      const durationMinutes = duration ? parseInt(duration, 10) : undefined
      logActivity.mutate({
        type,
        summary,
        duration_minutes: durationMinutes,
        notes: summary,
      })
    } else {
      const label = ACTIVITY_TYPES.find((a) => a.value === type)?.label ?? type
      toast.success('Activity logged', {
        description: `${label} logged for ${entityName}.`,
      })
      handleClose()
    }
  }

  const showDuration = type === 'call' || type === 'meeting'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>Record an interaction with {entityName}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Activity type */}
            <div className="grid gap-2">
              <Label>Activity Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {ACTIVITY_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all',
                      type === value
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border hover:border-muted-foreground/40 text-muted-foreground'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', type === value ? 'text-primary' : '')} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            {showDuration && (
              <div className="grid gap-2">
                <Label htmlFor="log-duration">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  Duration (minutes)
                </Label>
                <input
                  id="log-duration"
                  type="number"
                  min={1}
                  placeholder="e.g. 30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            )}

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="log-notes">Notes</Label>
              <textarea
                id="log-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="What happened? Key discussion points, outcomes..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={contactId ? logActivity.isPending : false}>
              {contactId && logActivity.isPending ? 'Logging…' : 'Log Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
