import { DollarSign, TrendingUp, Briefcase, Trophy, Target } from 'lucide-react'
import { StatCard, type StatCardAccent } from '@/components/common/StatCard'
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

  const stats: {
    label: string
    value: string
    icon: typeof DollarSign
    accent: StatCardAccent
  }[] = [
    { label: 'Total Pipeline', value: currencyFormat.format(totalValue), icon: DollarSign, accent: 'primary' },
    { label: 'Weighted Value', value: currencyFormat.format(weightedValue), icon: TrendingUp, accent: 'secondary' },
    { label: 'Open Deals', value: String(open.length), icon: Briefcase, accent: 'warning' },
    { label: 'Won Deals', value: String(won.length), icon: Trophy, accent: 'success' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, accent: 'success' },
  ]

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
