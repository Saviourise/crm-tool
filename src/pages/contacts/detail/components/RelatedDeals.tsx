import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_OPPORTUNITIES, STAGE_CONFIG } from '@/pages/pipeline/data'

interface RelatedDealsProps {
  contactName: string
}

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RelatedDeals({ contactName }: RelatedDealsProps) {
  const deals = MOCK_OPPORTUNITIES.filter((opp) => opp.contact === contactName)

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Related Deals</h3>
        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No deals linked to this contact.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {deals.map((deal) => {
              const config = STAGE_CONFIG[deal.stage]
              return (
                <div
                  key={deal.id}
                  className={cn('border-l-4 pl-3 py-1', config.cardBorderClass.replace('border-l-4', ''))}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{deal.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Close: {deal.expectedCloseDate}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className={cn('text-xs', config.badgeClass)}>
                        {config.label}
                      </Badge>
                      <span className="text-xs font-semibold tabular-nums">
                        {currencyFormat.format(deal.value)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
