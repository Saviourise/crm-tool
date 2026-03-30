import { useQuery } from '@tanstack/react-query'
import { Users, Sparkles, CheckCircle, ArrowRightLeft, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { leadsApi } from '@/api/leads'

export function LeadsStats({ isLoading }: { isLoading: boolean }) {
  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: () => leadsApi.stats(),
  })

  const showLoading = isLoading ?? statsLoading

  const s = data?.data

  const stats = [
    {
      label: 'Total Leads',
      value: s?.total ?? 0,
      icon: Users,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'New',
      value: s?.new ?? 0,
      icon: Sparkles,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Qualified',
      value: s?.qualified ?? 0,
      icon: CheckCircle,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Converted',
      value: s?.converted ?? 0,
      icon: ArrowRightLeft,
      bg: 'bg-[oklch(var(--metric-purple))]',
      text: 'text-[oklch(var(--secondary))]',
      border: 'border-l-[oklch(var(--secondary))]',
    },
    {
      label: 'Avg Score',
      value: s ? Math.round(s.avg_score) : 0,
      icon: TrendingUp,
      bg: 'bg-[oklch(var(--metric-orange))]',
      text: 'text-[oklch(var(--warning))]',
      border: 'border-l-[oklch(var(--warning))]',
    },
  ]

  if (showLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-l-4 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="h-8 w-6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 mt-2 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn('border-l-4 overflow-hidden', stat.border)}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn('p-2.5 rounded-lg shrink-0', stat.bg, stat.text)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className={cn('text-2xl font-bold')}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
