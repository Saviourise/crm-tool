import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle, Briefcase, DollarSign } from 'lucide-react'
import { StatCard, StatCardSkeleton, type StatCardAccent } from '@/components/common/StatCard'
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

  const stats: {
    label: string
    value: string | number
    icon: typeof Building2
    accent: StatCardAccent
  }[] = [
    { label: 'Total Companies', value: total, icon: Building2, accent: 'primary' },
    { label: 'Active', value: active, icon: CheckCircle, accent: 'success' },
    { label: 'Open Deals', value: openDeals, icon: Briefcase, accent: 'warning' },
    { label: 'Total Revenue', value: formatRevenue(totalRevenue), icon: DollarSign, accent: 'secondary' },
  ]

  if (showLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
