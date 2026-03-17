import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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

  const stats = [
    {
      label: 'Total Contacts',
      value: total,
      icon: Users,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Active',
      value: active,
      icon: UserCheck,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Prospects',
      value: prospects,
      icon: TrendingUp,
      bg: 'bg-[oklch(var(--metric-orange))]',
      text: 'text-[oklch(var(--warning))]',
      border: 'border-l-[oklch(var(--warning))]',
    },
    {
      label: 'Inactive',
      value: inactive,
      icon: UserX,
      bg: 'bg-[oklch(var(--metric-red))]',
      text: 'text-destructive',
      border: 'border-l-destructive',
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
