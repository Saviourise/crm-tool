import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { StatCard, StatCardSkeleton, type StatCardAccent } from '@/components/common/StatCard'
import { contactsApi } from '@/api/contacts'

interface ContactStatsProps {
  isLoading?: boolean
}

export function ContactStats({ isLoading }: ContactStatsProps) {
  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => contactsApi.stats(),
  })

  const showLoading = isLoading ?? statsLoading

  const statsData = data?.data
  const total = statsData?.total ?? 0
  const active = statsData?.active ?? 0
  const prospects = statsData?.prospects ?? 0
  const inactive = statsData?.inactive ?? 0

  const stats: {
    label: string
    value: number
    icon: typeof Users
    accent: StatCardAccent
  }[] = [
    { label: 'Total Contacts', value: total, icon: Users, accent: 'primary' },
    { label: 'Active', value: active, icon: UserCheck, accent: 'success' },
    { label: 'Prospects', value: prospects, icon: TrendingUp, accent: 'warning' },
    { label: 'Inactive', value: inactive, icon: UserX, accent: 'destructive' },
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
