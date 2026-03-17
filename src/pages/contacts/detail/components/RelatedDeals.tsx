import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STAGE_CONFIG } from '@/pages/pipeline/data'
import { contactsApi } from '@/api/contacts'

interface RelatedDealsProps {
  contactId: string
}

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function RelatedDeals({ contactId }: RelatedDealsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', contactId, 'deals'],
    queryFn: () => contactsApi.deals(contactId),
    enabled: !!contactId,
  })

  const deals = data?.data?.results ?? []

  const defaultConfig = STAGE_CONFIG.prospecting

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Related Deals</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : deals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No deals linked to this contact.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {deals.map((deal) => {
              const config = (STAGE_CONFIG as Record<string, typeof defaultConfig>)[deal.stage] ?? defaultConfig
              return (
                <div
                  key={deal.id}
                  className={cn('border-l-4 pl-3 py-1', config.cardBorderClass.replace('border-l-4', ''))}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{deal.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Close: {deal.expected_close_date ?? '—'}
                      </p>
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
