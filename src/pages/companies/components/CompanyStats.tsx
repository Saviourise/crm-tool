import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle, Briefcase, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatRevenue } from '../utils'
import { companiesApi } from '@/api/companies'

interface CompanyStatsProps {
  isLoading?: boolean
}

export function CompanyStats({ isLoading }: CompanyStatsProps) {
  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['companies', 'stats'],
    queryFn: () => companiesApi.stats(),
  })

  const showLoading = isLoading ?? statsLoading

  const statsData = data?.data
  const total = statsData?.total ?? 0
  const active = statsData?.active ?? 0
  const openDeals = statsData?.open_deals ?? 0
  const totalRevenue = statsData?.total_revenue ?? 0

  const stats = [
    {
      label: 'Total Companies',
      value: total,
      icon: Building2,
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Active',
      value: active,
      icon: CheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-l-emerald-500',
    },
    {
      label: 'Open Deals',
      value: openDeals,
      icon: Briefcase,
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-l-amber-500',
    },
    {
      label: 'Total Revenue',
      value: formatRevenue(totalRevenue),
      icon: DollarSign,
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-l-violet-500',
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn('border-l-4 overflow-hidden', stat.border)}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn('p-2.5 rounded-lg shrink-0', stat.bg, stat.text)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
