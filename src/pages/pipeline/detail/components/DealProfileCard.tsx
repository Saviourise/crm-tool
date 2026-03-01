import { User, Calendar, Building2, TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STAGE_CONFIG } from '../../data'
import type { Opportunity } from '../../typings'

interface DealProfileCardProps {
  opportunity: Opportunity
}

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function DealProfileCard({ opportunity }: DealProfileCardProps) {
  const config = STAGE_CONFIG[opportunity.stage]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Deal name + stage */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold leading-tight">{opportunity.name}</h1>
            <Badge variant="outline" className={cn('text-xs font-medium', config.badgeClass)}>
              {config.label}
            </Badge>
          </div>

          {/* Value + probability */}
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide font-medium">Deal Value</p>
              <p className="text-3xl font-bold text-primary tabular-nums">
                {currencyFormat.format(opportunity.value)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide font-medium">Win Probability</p>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${opportunity.probability}%` }}
                  />
                </div>
                <span className="text-base font-semibold tabular-nums">{opportunity.probability}%</span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{opportunity.company}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Contact: <span className="font-medium">{opportunity.contact}</span></span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Assigned to <span className="font-medium">{opportunity.assignedTo}</span></span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Close date: <span className="font-medium">{opportunity.expectedCloseDate}</span></span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Created: {opportunity.createdAt}</span>
            </div>
          </div>

          {opportunity.notes && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{opportunity.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
