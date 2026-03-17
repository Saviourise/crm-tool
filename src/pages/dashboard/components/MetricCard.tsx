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
  isLoading?: boolean
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

export function MetricCard({ title, value, change, trend, icon: Icon, color, isLoading }: MetricCardProps) {
  const isPositive = trend === 'up'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const variant = colorVariants[color]

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden border-l-4 transition-all duration-200', variant.border)}>
        <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md', variant.border)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1 truncate">{title}</p>
            <h3 className="text-xl font-bold tracking-tight mb-2 sm:text-2xl">{value}</h3>
            <div className="flex items-center gap-1 flex-wrap">
              <TrendIcon
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  isPositive ? 'text-[oklch(var(--success))]' : 'text-destructive'
                )}
              />
              <span
                className={cn(
                  'text-xs font-semibold',
                  isPositive ? 'text-[oklch(var(--success))]' : 'text-destructive'
                )}
              >
                {change}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">from last month</span>
            </div>
          </div>
          <div className={cn('p-2.5 rounded-lg shrink-0', variant.bg, variant.text)}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
