import { format, parseISO } from 'date-fns'
import { X, Pencil, Trash2, Clock, User, Link, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '../typings'
import { useAuth } from '@/auth/context'

interface EventDetailPopoverProps {
  event: CalendarEvent | null
  onClose: () => void
}

const TYPE_LABEL: Record<string, string> = {
  task: 'Task',
  call: 'Call',
  meeting: 'Meeting',
  demo: 'Demo',
}

const TYPE_BADGE: Record<string, string> = {
  task: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  call: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  meeting: 'bg-primary/10 text-primary border-primary/20',
  demo: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
}

export function EventDetailPopover({ event, onClose }: EventDetailPopoverProps) {
  const { can } = useAuth()
  if (!event) return null

  const formattedDate = format(parseISO(event.date), 'EEEE, MMMM d, yyyy')

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className={cn('w-1 self-stretch rounded-full shrink-0', event.color)} />
            <div className="min-w-0">
              <Badge
                variant="outline"
                className={cn('text-xs mb-1', TYPE_BADGE[event.type])}
              >
                {TYPE_LABEL[event.type]}
              </Badge>
              <DialogTitle className="text-base leading-snug">{event.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pl-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {formattedDate} at {event.startTime}
              <span className="ml-1">({event.duration} min)</span>
            </span>
          </div>

          {event.assignee && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>{event.assignee}</span>
            </div>
          )}

          {event.linkedContact && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link className="h-4 w-4 shrink-0" />
              <span>{event.linkedContact}</span>
            </div>
          )}

          {event.description && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{event.description}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {can('calendar.edit') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info('Edit event', { description: 'Event editing coming soon.' })}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
            {can('calendar.delete') && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  toast.error('Event deleted', { description: `"${event.title}" has been removed.` })
                  onClose()
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
