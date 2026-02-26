import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Contact } from '../typings'

interface ContactStatsProps {
  contacts: Contact[]
}

export function ContactStats({ contacts }: ContactStatsProps) {
  const total = contacts.length
  const active = contacts.filter((c) => c.status === 'active').length
  const prospects = contacts.filter((c) => c.status === 'prospect').length
  const inactive = contacts.filter((c) => c.status === 'inactive').length

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
