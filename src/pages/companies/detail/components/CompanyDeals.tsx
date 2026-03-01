import { DollarSign, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_OPPORTUNITIES, STAGE_CONFIG } from '@/pages/pipeline/data'

interface CompanyDealsProps {
  companyName: string
}

export function CompanyDeals({ companyName }: CompanyDealsProps) {
  const deals = MOCK_OPPORTUNITIES.filter(
    (o) => o.company.toLowerCase() === companyName.toLowerCase()
  )

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
        const stageConfig = STAGE_CONFIG[deal.stage]
        return (
          <Card key={deal.id} className={cn('border-l-4', stageConfig.cardBorderClass.split(' ')[1])}>
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
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {deal.expectedCloseDate}
                </span>
              </div>
              {deal.assignedTo && (
                <p className="text-xs text-muted-foreground mt-1">Assigned to {deal.assignedTo}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
