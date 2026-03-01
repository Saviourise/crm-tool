import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CalendarView } from '../typings'
import { useAuth } from '@/auth/context'

interface CalendarHeaderProps {
  view: CalendarView
  onViewChange: (v: CalendarView) => void
  currentDate: Date
  onNavigate: (dir: 'prev' | 'next' | 'today') => void
  onAddEvent: () => void
}

const VIEW_OPTIONS: { id: CalendarView; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
]

function getDisplayLabel(view: CalendarView, date: Date): string {
  if (view === 'month') {
    return format(date, 'MMMM yyyy')
  }
  if (view === 'week') {
    const start = startOfWeek(date)
    const end = endOfWeek(date)
    if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
      return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
    }
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
  }
  return format(date, 'EEEE, MMMM d, yyyy')
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onNavigate,
  onAddEvent,
}: CalendarHeaderProps) {
  const { can } = useAuth()

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Left: navigation — order 1 on mobile */}
      <div className="flex items-center gap-1 order-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onNavigate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onNavigate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="ml-1" onClick={() => onNavigate('today')}>
          Today
        </Button>
      </div>

      {/* Center: label — wraps to full-width second row on mobile, inline on sm+ */}
      <h2 className="text-base font-semibold text-center order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
        {getDisplayLabel(view, currentDate)}
      </h2>

      {/* Right: view toggle + add — order 2 on mobile (same row as nav, pushed right) */}
      <div className="flex items-center gap-2 order-2 ml-auto sm:order-3 sm:ml-0">
        <div className="flex rounded-md border overflow-hidden">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onViewChange(opt.id)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                view === opt.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {can('calendar.create') && (
          <Button size="sm" onClick={onAddEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  )
}
