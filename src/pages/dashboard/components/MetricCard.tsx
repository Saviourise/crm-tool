import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

const colorVariants = {
  blue: {
    bg: 'bg-[oklch(var(--metric-blue))]',
    text: 'text-primary',
    border: 'border-l-primary/30',
  },
  green: {
    bg: 'bg-[oklch(var(--metric-green))]',
    text: 'text-[oklch(var(--success))]',
    border: 'border-l-[oklch(var(--success))]/30',
  },
  orange: {
    bg: 'bg-[oklch(var(--metric-orange))]',
    text: 'text-[oklch(var(--warning))]',
    border: 'border-l-[oklch(var(--warning))]/30',
  },
  purple: {
    bg: 'bg-[oklch(var(--metric-purple))]',
    text: 'text-secondary',
    border: 'border-l-secondary/30',
  },
  red: {
    bg: 'bg-[oklch(var(--metric-red))]',
    text: 'text-destructive',
    border: 'border-l-destructive/30',
  },
}

export function MetricCard({ title, value, change, trend, icon: Icon, color }: MetricCardProps) {
  const isPositive = trend === 'up'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const variant = colorVariants[color]

  return (
    <Card className={cn('overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md', variant.border)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight mb-3">{value}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                <TrendIcon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isPositive ? 'text-[oklch(var(--success))]' : 'text-destructive'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isPositive ? 'text-[oklch(var(--success))]' : 'text-destructive'
                  )}
                >
                  {change}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </div>
          <div className={cn('p-3.5 rounded-xl shrink-0', variant.bg, variant.text)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
