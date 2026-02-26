import { Users, Sparkles, CheckCircle, ArrowRightLeft, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Lead } from '../typings'

interface LeadsStatsProps {
  leads: Lead[]
}

export function LeadsStats({ leads }: LeadsStatsProps) {
  const total = leads.length
  const newLeads = leads.filter((l) => l.status === 'new').length
  const qualified = leads.filter((l) => l.status === 'qualified').length
  const converted = leads.filter((l) => l.status === 'converted').length
  const avgScore = total > 0
    ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / total)
    : 0

  const stats = [
    {
      label: 'Total Leads',
      value: total,
      icon: Users,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'New',
      value: newLeads,
      icon: Sparkles,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Qualified',
      value: qualified,
      icon: CheckCircle,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Converted',
      value: converted,
      icon: ArrowRightLeft,
      bg: 'bg-[oklch(var(--metric-purple))]',
      text: 'text-[oklch(var(--secondary))]',
      border: 'border-l-[oklch(var(--secondary))]',
    },
    {
      label: 'Avg Score',
      value: avgScore,
      icon: TrendingUp,
      bg: 'bg-[oklch(var(--metric-orange))]',
      text: 'text-[oklch(var(--warning))]',
      border: 'border-l-[oklch(var(--warning))]',
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
