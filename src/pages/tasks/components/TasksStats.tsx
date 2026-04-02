import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Circle, Clock, AlertTriangle, Ban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { tasksApi } from '@/api/tasks'
import { TASKS_STATS_QUERY_KEY } from '../queryKeys'

export function TasksStats() {
  const { data } = useQuery({
    queryKey: TASKS_STATS_QUERY_KEY,
    queryFn: () => tasksApi.stats(),
  })

  const s = data?.data
  const all = s?.all ?? 0
  const completionRate = all > 0 ? Math.round(((s?.completed ?? 0) / all) * 100) : 0

  const stats = [
    {
      label: 'To Do',
      value: s?.to_do ?? 0,
      icon: Circle,
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-l-muted-foreground/40',
    },
    {
      label: 'In Progress',
      value: s?.in_progress ?? 0,
      icon: Clock,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Completed',
      value: s?.completed ?? 0,
      sub: `${completionRate}% rate`,
      icon: CheckSquare,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Overdue',
      value: s?.overdue ?? 0,
      icon: AlertTriangle,
      bg: 'bg-[oklch(var(--metric-red))]',
      text: 'text-destructive',
      border: 'border-l-destructive',
    },
    {
      label: 'Cancelled',
      value: s?.cancelled ?? 0,
      icon: Ban,
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-l-muted-foreground/40',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
