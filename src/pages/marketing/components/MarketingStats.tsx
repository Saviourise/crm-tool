import { Megaphone, Send, MailOpen, MousePointerClick, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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

  const stats = [
    {
      label: 'Total Campaigns',
      value: String(total),
      sub: `${active} active`,
      icon: Megaphone,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
    },
    {
      label: 'Emails Sent',
      value: formatCount(totalSent),
      icon: Send,
      bg: 'bg-[oklch(var(--metric-purple))]',
      text: 'text-[oklch(var(--secondary))]',
      border: 'border-l-[oklch(var(--secondary))]',
    },
    {
      label: 'Emails Opened',
      value: formatCount(totalOpened),
      icon: MailOpen,
      bg: 'bg-[oklch(var(--metric-green))]',
      text: 'text-[oklch(var(--success))]',
      border: 'border-l-[oklch(var(--success))]',
    },
    {
      label: 'Avg Open Rate',
      value: `${avgOpenRate}%`,
      icon: TrendingUp,
      bg: 'bg-[oklch(var(--metric-orange))]',
      text: 'text-[oklch(var(--warning))]',
      border: 'border-l-[oklch(var(--warning))]',
    },
    {
      label: 'Avg Click Rate',
      value: `${avgClickRate}%`,
      icon: MousePointerClick,
      bg: 'bg-[oklch(var(--metric-blue))]',
      text: 'text-primary',
      border: 'border-l-primary',
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
              <p className="text-2xl font-bold truncate">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {'sub' in stat && stat.sub && (
                <p className="text-xs text-muted-foreground/70">{stat.sub}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
