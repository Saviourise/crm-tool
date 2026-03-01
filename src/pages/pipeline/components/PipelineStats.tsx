import { DollarSign, TrendingUp, Briefcase, Trophy, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { currencyFormat, getTotalPipelineValue, getWeightedPipelineValue } from '../utils'
import type { Opportunity } from '../typings'

interface PipelineStatsProps {
  opportunities: Opportunity[]
}

export function PipelineStats({ opportunities }: PipelineStatsProps) {
  const active = opportunities.filter((o) => o.stage !== 'closed-lost')
  const won = opportunities.filter((o) => o.stage === 'closed-won')
  const lost = opportunities.filter((o) => o.stage === 'closed-lost')
  const open = opportunities.filter((o) => o.stage !== 'closed-won' && o.stage !== 'closed-lost')

  const totalValue = getTotalPipelineValue(active)
  const weightedValue = getWeightedPipelineValue(open)
  const winRate = won.length + lost.length > 0
    ? Math.round((won.length / (won.length + lost.length)) * 100)
    : 0

  const stats = [
    {
      label: 'Total Pipeline',
      value: currencyFormat.format(totalValue),
      icon: DollarSign,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Weighted Value',
      value: currencyFormat.format(weightedValue),
      icon: TrendingUp,
      bg: 'bg-[oklch(var(--metric-purple))]',
      text: 'text-[oklch(var(--secondary))]',
      border: 'border-l-[oklch(var(--secondary))]',
    },
    {
      label: 'Open Deals',
      value: String(open.length),
      icon: Briefcase,
      bg: 'bg-[oklch(var(--metric-orange))]',
      text: 'text-[oklch(var(--warning))]',
      border: 'border-l-[oklch(var(--warning))]',
    },
    {
      label: 'Won Deals',
      value: String(won.length),
      icon: Trophy,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      icon: Target,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
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
              <p className="text-xl font-bold truncate">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
