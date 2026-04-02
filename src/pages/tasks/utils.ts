import { parseISO } from 'date-fns'
import { Phone, Mail, Users, RefreshCw, Monitor, FileText, Tag } from 'lucide-react'
import type { TaskPriority, TaskStatus, TaskCategory } from './typings'

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground/60',
  },
  medium: {
    label: 'Medium',
    className: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
    dot: 'bg-primary',
  },
  high: {
    label: 'High',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  urgent: {
    label: 'Urgent',
    className: 'bg-[oklch(var(--metric-red))] text-destructive border-destructive/20',
    dot: 'bg-destructive',
  },
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  'todo': {
    label: 'To Do',
    className: 'bg-muted text-muted-foreground border-border',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  },
  'completed': {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  },
  'cancelled': {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground/60 border-border',
  },
}

export const CATEGORY_ICONS: Record<TaskCategory, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  'follow-up': RefreshCw,
  demo: Monitor,
  proposal: FileText,
  other: Tag,
}

// Returns true if due date (ISO string YYYY-MM-DD) is in the past and task is not done
export function isOverdue(dueDate?: string, status?: string): boolean {
  if (!dueDate || status === 'completed' || status === 'cancelled') return false
  try {
    const parsed = parseISO(dueDate)
    return !isNaN(parsed.getTime()) && parsed < new Date()
  } catch {
    return false
  }
}
