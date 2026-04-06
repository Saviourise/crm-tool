import { Megaphone, Send, MailOpen, MousePointerClick, TrendingUp } from 'lucide-react'
import { StatCard, type StatCardAccent } from '@/components/common/StatCard'
import { getOpenRate, getClickRate, formatCount } from '../utils'
import type { Campaign } from '../typings'

export function MarketingStats({ campaigns }: { campaigns: Campaign[] }) {
  const total = campaigns.length
  const active = campaigns.filter((c) => c.status === 'active').length

  const totalSent = campaigns.reduce((s, c) => s + c.metrics.sent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.metrics.opened, 0)
  const totalClicked = campaigns.reduce((s, c) => s + c.metrics.clicked, 0)

  const avgOpenRate = getOpenRate({ sent: totalSent, opened: totalOpened, clicked: totalClicked, converted: 0 })
  const avgClickRate = getClickRate({ sent: totalSent, opened: totalOpened, clicked: totalClicked, converted: 0 })

  const stats: {
    label: string
    value: string
    sub?: string
    icon: typeof Megaphone
    accent: StatCardAccent
  }[] = [
    {
      label: 'Total Campaigns',
      value: String(total),
      sub: `${active} active`,
      icon: Megaphone,
      accent: 'primary',
    },
    {
      label: 'Emails Sent',
      value: formatCount(totalSent),
      icon: Send,
      accent: 'secondary',
    },
    {
      label: 'Emails Opened',
      value: formatCount(totalOpened),
      icon: MailOpen,
      accent: 'success',
    },
    {
      label: 'Avg Open Rate',
      value: `${avgOpenRate}%`,
      icon: TrendingUp,
      accent: 'warning',
    },
    {
      label: 'Avg Click Rate',
      value: `${avgClickRate}%`,
      icon: MousePointerClick,
      accent: 'primary',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          sub={stat.sub}
          accent={stat.accent}
        />
      ))}
    </div>
  )
}
