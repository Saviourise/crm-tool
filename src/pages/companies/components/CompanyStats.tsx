import { Building2, CheckCircle, Briefcase, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatRevenue } from '../utils'
import type { Company } from '../typings'

interface CompanyStatsProps {
  companies: Company[]
}

export function CompanyStats({ companies }: CompanyStatsProps) {
  const total = companies.length
  const active = companies.filter((c) => c.status === 'active').length
  const openDeals = companies.reduce((sum, c) => sum + c.openDeals, 0)
  const totalRevenue = companies.reduce((sum, c) => sum + c.annualRevenue, 0)

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
