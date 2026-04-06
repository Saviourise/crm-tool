import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Circle, Clock, AlertTriangle, Ban } from 'lucide-react'
import { StatCard, type StatCardAccent } from '@/components/common/StatCard'
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

  const stats: {
    label: string
    value: number
    sub?: string
    icon: typeof Circle
    accent: StatCardAccent
  }[] = [
    {
      label: 'To Do',
      value: s?.to_do ?? 0,
      icon: Circle,
      accent: 'muted',
    },
    {
      label: 'In Progress',
      value: s?.in_progress ?? 0,
      icon: Clock,
      accent: 'primary',
    },
    {
      label: 'Completed',
      value: s?.completed ?? 0,
      sub: `${completionRate}% rate`,
      icon: CheckSquare,
      accent: 'success',
    },
    {
      label: 'Overdue',
      value: s?.overdue ?? 0,
      icon: AlertTriangle,
      accent: 'destructive',
    },
    {
      label: 'Cancelled',
      value: s?.cancelled ?? 0,
      icon: Ban,
      accent: 'muted',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          sub={stat.sub}
          accent={stat.accent}
        />
      ))}
    </div>
  )
}
