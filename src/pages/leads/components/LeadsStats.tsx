import { useQuery } from '@tanstack/react-query'
import { Users, Sparkles, CheckCircle, ArrowRightLeft, TrendingUp } from 'lucide-react'
import { StatCard, StatCardSkeleton, type StatCardAccent } from '@/components/common/StatCard'
import { leadsApi } from '@/api/leads'

export function LeadsStats({ isLoading }: { isLoading: boolean }) {
  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: () => leadsApi.stats(),
  })

  const showLoading = isLoading ?? statsLoading

  const s = data?.data

  const stats: {
    label: string
    value: number
    icon: typeof Users
    accent: StatCardAccent
  }[] = [
    { label: 'Total Leads', value: s?.total ?? 0, icon: Users, accent: 'primary' },
    { label: 'New', value: s?.new ?? 0, icon: Sparkles, accent: 'primary' },
    { label: 'Qualified', value: s?.qualified ?? 0, icon: CheckCircle, accent: 'success' },
    { label: 'Converted', value: s?.converted ?? 0, icon: ArrowRightLeft, accent: 'secondary' },
    { label: 'Avg Score', value: s ? Math.round(s.avg_score) : 0, icon: TrendingUp, accent: 'warning' },
  ]

  if (showLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          accent={stat.accent}
        />
      ))}
    </div>
  )
}
