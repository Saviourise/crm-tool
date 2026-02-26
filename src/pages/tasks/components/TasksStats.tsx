import { CheckSquare, Circle, Clock, AlertTriangle, Ban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { isOverdue } from '../utils'
import type { Task } from '../typings'

export function TasksStats({ tasks }: { tasks: Task[] }) {
  const todo = tasks.filter((t) => t.status === 'todo').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length
  const cancelled = tasks.filter((t) => t.status === 'cancelled').length
  const completionRate = tasks.length > 0
    ? Math.round((completed / tasks.length) * 100)
    : 0

  const stats = [
    {
      label: 'To Do',
      value: String(todo),
      icon: Circle,
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-l-muted-foreground/40',
    },
    {
      label: 'In Progress',
      value: String(inProgress),
      icon: Clock,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Completed',
      value: String(completed),
      sub: `${completionRate}% rate`,
      icon: CheckSquare,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Overdue',
      value: String(overdue),
      icon: AlertTriangle,
      bg: 'bg-[oklch(var(--metric-red))]',
      text: 'text-destructive',
      border: 'border-l-destructive',
    },
    {
      label: 'Cancelled',
      value: String(cancelled),
      icon: Ban,
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-l-muted-foreground/40',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn('border-l-4 overflow-hidden', stat.border)}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn('p-2.5 rounded-lg shrink-0', stat.bg, stat.text)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {'sub' in stat && stat.sub && (
                <p className="text-xs text-muted-foreground/70">{stat.sub}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
