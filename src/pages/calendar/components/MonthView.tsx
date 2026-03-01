import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
  isToday,
} from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '../typings'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE_EVENTS = 2

export function MonthView({ currentDate, events, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter((e) => e.date === dateStr)
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: '340px' }}>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const remainingCount = dayEvents.length - MAX_VISIBLE_EVENTS

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[100px] border-r border-b last:border-r-0 p-1.5',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              {/* Day number */}
              <div className="flex justify-center mb-1">
                <span
                  className={cn(
                    'text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium',
                    today
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {visibleEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      'w-full text-left px-1.5 py-0.5 rounded text-xs font-medium text-white truncate block',
                      event.color
                    )}
                  >
                    {event.title}
                  </button>
                ))}
                {remainingCount > 0 && (
                  <p className="text-xs text-muted-foreground pl-1">+{remainingCount} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
