import { useQuery } from '@tanstack/react-query'
import { DollarSign, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { companiesApi } from '@/api/companies'
import type { Stage } from '@/pages/pipeline/typings'
import { STAGE_CONFIG } from '@/pages/pipeline/data'

interface CompanyDealsProps {
  companyId: string
}

export function CompanyDeals({ companyId }: CompanyDealsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['companies', companyId, 'deals'],
    queryFn: () => companiesApi.deals(companyId),
  })

  const deals = data?.data?.results ?? []

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-32 bg-muted rounded animate-pulse mb-3" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-base font-medium">No deals found for this company</p>
        <p className="text-sm mt-1">Create deals and link them to this company to see them here.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {deals.map((deal) => {
        const stageConfig = STAGE_CONFIG[deal.stage as Stage] ?? {
          label: deal.stage,
          badgeClass: '',
          cardBorderClass: 'border-l-4 border-l-muted',
        }
        return (
          <Card key={deal.id} className={stageConfig.cardBorderClass ?? 'border-l-4 border-l-muted'}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-medium leading-snug">{deal.name}</p>
                <Badge
                  variant="outline"
                  className={cn('text-xs shrink-0', stageConfig.badgeClass)}
                >
                  {stageConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                </span>
                {deal.expected_close_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {deal.expected_close_date}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
