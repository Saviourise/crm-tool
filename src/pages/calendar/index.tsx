import { useState } from 'react'
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import { CalendarHeader } from './components/CalendarHeader'
import { MonthView } from './components/MonthView'
import { WeekView } from './components/WeekView'
import { DayView } from './components/DayView'
import { EventDetailPopover } from './components/EventDetailPopover'
import { AddEventDialog } from './components/AddEventDialog'
import { MOCK_EVENTS } from './data'
import type { CalendarView, CalendarEvent } from './typings'

export default function Calendar() {
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)) // March 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  function navigate(dir: 'prev' | 'next' | 'today') {
    if (dir === 'today') {
      setCurrentDate(new Date(2026, 2, 1))
      return
    }
    if (view === 'month') {
      setCurrentDate(dir === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(dir === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    } else {
      setCurrentDate(dir === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Manage your schedule and appointments.</p>
      </div>

      <CalendarHeader
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onNavigate={navigate}
        onAddEvent={() => setAddOpen(true)}
      />

      <div className="border rounded-lg overflow-hidden bg-card">
        {view === 'month' && (
          <MonthView currentDate={currentDate} events={MOCK_EVENTS} onEventClick={setSelectedEvent} />
        )}
        {view === 'week' && (
          <WeekView currentDate={currentDate} events={MOCK_EVENTS} onEventClick={setSelectedEvent} />
        )}
        {view === 'day' && (
          <DayView currentDate={currentDate} events={MOCK_EVENTS} onEventClick={setSelectedEvent} />
        )}
      </div>

      <EventDetailPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <AddEventDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
