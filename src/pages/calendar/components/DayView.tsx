import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '../typings'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

const HOUR_HEIGHT = 64 // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number)
  return { hour: h, minute: m }
}

export function DayView({ currentDate, events, onEventClick }: DayViewProps) {
  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dayEvents = events.filter((e) => e.date === dateStr)

  return (
    <div>
      {/* Header */}
      <div className="flex border-b px-4 py-3">
        <div className="w-16 shrink-0" />
        <div>
          <p className="text-sm text-muted-foreground uppercase">{format(currentDate, 'EEEE')}</p>
          <p className="text-2xl font-bold">{format(currentDate, 'MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Time grid */}
      <div className="flex overflow-y-auto max-h-[600px]">
        {/* Time labels */}
        <div className="w-16 shrink-0">
          {HOURS.map((hour) => (
            <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
              <span className="absolute -top-2.5 right-2 text-xs text-muted-foreground select-none">
                {hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
              </span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div
          className="flex-1 border-l relative"
          style={{ minHeight: HOURS.length * HOUR_HEIGHT }}
        >
          {/* Hour lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="border-t border-border/50"
              style={{ height: HOUR_HEIGHT }}
            />
          ))}

          {/* Events */}
          {dayEvents.map((event) => {
            const { hour, minute } = parseTime(event.startTime)
            const top = hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT
            const height = Math.max((event.duration / 60) * HOUR_HEIGHT, 24)

            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={cn(
                  'absolute left-1 right-4 rounded px-2 py-1 text-left overflow-hidden text-white',
                  event.color
                )}
                style={{ top, height }}
              >
                <p className="text-sm font-semibold truncate leading-tight">{event.title}</p>
                <p className="text-xs opacity-90">{event.startTime} · {event.duration} min</p>
                {event.assignee && (
                  <p className="text-xs opacity-80 truncate">{event.assignee}</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {dayEvents.length === 0 && (
        <div className="py-12 text-center text-muted-foreground border-l ml-16">
          <p className="text-sm">No events scheduled for this day</p>
        </div>
      )}
    </div>
  )
}
