import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

const colorVariants = {
  blue: 'bg-[oklch(var(--metric-blue))] text-primary',
  green: 'bg-[oklch(var(--metric-green))] text-[oklch(var(--success))]',
  orange: 'bg-[oklch(var(--metric-orange))] text-[oklch(var(--warning))]',
  purple: 'bg-[oklch(var(--metric-purple))] text-secondary',
  red: 'bg-[oklch(var(--metric-red))] text-destructive',
}

export function MetricCard({ title, value, change, trend, icon: Icon, color }: MetricCardProps) {
  const isPositive = trend === 'up'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2 mb-3">{value}</h3>
            <div className="flex items-center gap-1.5">
              <TrendIcon
                className={cn(
                  'h-4 w-4',
                  isPositive ? 'text-[oklch(var(--success))]' : 'text-destructive'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive ? 'text-[oklch(var(--success))]' : 'text-destructive'
                )}
              >
                {change}
              </span>
              <span className="text-sm text-muted-foreground">from last month</span>
            </div>
          </div>
          <div className={cn('p-3 rounded-xl', colorVariants[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
