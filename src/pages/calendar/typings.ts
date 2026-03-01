export type EventType = 'task' | 'call' | 'meeting' | 'demo'

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  date: string // ISO date string 'YYYY-MM-DD'
  startTime: string // '09:00', '14:30'
  duration: number // minutes
  assignee?: string
  linkedContact?: string
  description?: string
  color: string // tailwind bg color class
}

export type CalendarView = 'month' | 'week' | 'day'
