import { startOfWeek, addDays, format, isSameDay, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '../typings'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

const HOUR_HEIGHT = 60 // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number)
  return { hour: h, minute: m }
}

export function WeekView({ currentDate, events, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter((e) => e.date === dateStr)
  }

  return (
    <div className="overflow-x-auto">
      {/* Header row */}
      <div className="flex border-b">
        {/* Time gutter */}
        <div className="w-16 shrink-0" />
        {days.map((day, idx) => {
          const today = isToday(day)
          return (
            <div
              key={idx}
              className="flex-1 py-2 text-center border-l first:border-l-0"
            >
              <p className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</p>
              <span
                className={cn(
                  'text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full mx-auto',
                  today ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          )
        })}
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

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day)
          return (
            <div key={dayIdx} className="flex-1 border-l relative" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
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
                const height = Math.max((event.duration / 60) * HOUR_HEIGHT, 20)

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      'absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-left overflow-hidden text-white',
                      event.color
                    )}
                    style={{ top, height }}
                  >
                    <p className="text-xs font-semibold truncate leading-tight">{event.title}</p>
                    <p className="text-xs opacity-90 truncate">{event.startTime}</p>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
