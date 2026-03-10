import { useState } from 'react'
import { Zap, Building2, TrendingUp, Sparkles, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFeatureLabel } from '@/pages/settings/featureLabels'
import type { ApiPricingPlan } from '@/api/types'
import { cn } from '@/lib/utils'

export type BillingCycle = 'monthly' | 'yearly'

/** Plan metadata for icons and descriptions */
const PLAN_META: Record<string, { icon: React.ElementType; description: string }> = {
  free: { icon: Zap, description: 'Perfect for getting started' },
  basic: { icon: Building2, description: 'For small teams' },
  professional: { icon: TrendingUp, description: 'For growing teams' },
  premium: { icon: Sparkles, description: 'For scaling businesses' },
  enterprise: { icon: Shield, description: 'For large organizations' },
}

function formatSeats(seats: number): string {
  return seats < 0 ? 'Unlimited' : `Up to ${seats}`
}

function formatCredits(credits: number): string {
  return credits < 0 ? 'Unlimited' : credits.toLocaleString()
}

/** Shared plan card — use in onboarding (select) or billing (checkout) */
export function PlanCard(
  props:
    | {
      plan: ApiPricingPlan
      billingCycle: BillingCycle
      variant: 'select'
      selected?: boolean
      onSelect: (planKey: string) => void
      maxFeatures?: number
    }
    | {
      plan: ApiPricingPlan
      billingCycle: BillingCycle
      variant: 'checkout'
      currentPlanKey: string
      onCheckout: (planKey: string, cycle: BillingCycle) => void
      maxFeatures?: number
    }
) {
  const [expanded, setExpanded] = useState(false)
  const { plan, billingCycle, maxFeatures } = props
  const meta = PLAN_META[plan.key]
  const Icon = meta?.icon ?? Zap
  const description =
    meta?.description ??
    { free: 'Perfect for individuals getting started.', basic: 'For small teams ready to grow their pipeline.', professional: 'For growing teams that need automation and insights.', premium: 'For teams that want full AI-powered selling.', enterprise: 'Unlimited scale, full control, and white-glove support.' }[plan.key] ??
    plan.name

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  const isFree = price === 0 || price === null
  const isEnterprise = plan.key === 'enterprise'
  const monthlyEquivalent =
    billingCycle === 'yearly' && price !== null && price > 0 ? Math.round(price / 12) : price

  const displayPrice = isEnterprise ? 'Custom' : isFree ? 'Free' : `$${billingCycle === 'yearly' && price ? price : monthlyEquivalent}`
  const priceSuffix = !isFree && !isEnterprise ? `/${billingCycle === 'monthly' ? 'mo' : 'yr'}` : ''

  const isSelect = props.variant === 'select'
  const isSelected = isSelect && props.selected
  const isCurrent = !isSelect && plan.key === props.currentPlanKey

  const hasMoreFeatures = maxFeatures != null && plan.features.length > maxFeatures
  const featuresToShow =
    hasMoreFeatures && expanded ? plan.features : maxFeatures ? plan.features.slice(0, maxFeatures) : plan.features

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4 shrink-0', (isSelected || isCurrent) ? 'text-primary' : 'text-muted-foreground')} />
          <span className={cn('font-semibold text-sm', (isSelected || isCurrent) ? 'text-foreground' : 'text-muted-foreground')}>
            {plan.name}
          </span>
        </div>
        {plan.popular && !isCurrent && (
          <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">Popular</Badge>
        )}
        {isCurrent && (
          <Badge className="text-xs bg-primary text-primary-foreground shrink-0">Current</Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3">{description}</p>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn('font-bold text-foreground', isSelect ? 'text-2xl' : 'text-3xl')}>
          {displayPrice}
        </span>
        {priceSuffix && <span className="text-xs text-muted-foreground">{priceSuffix}</span>}
      </div>
      {billingCycle === 'yearly' && !isFree && !isEnterprise && price != null && (
        <p className="text-xs text-muted-foreground -mt-2 mb-3">billed annually</p>
      )}

      <div className="text-xs text-muted-foreground mb-4">
        <span className="font-medium text-foreground">{formatSeats(plan.seats)}</span>
        <span> seats · {formatCredits(plan.ai_credits)} AI credits</span>
      </div>

      <div className="flex-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">What is included?</p>
        <ul className="space-y-1.5">
          {featuresToShow.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rotate-45 bg-primary block" aria-hidden />
              {getFeatureLabel(f)}
            </li>
          ))}
          {hasMoreFeatures && (
            <li>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded((prev) => !prev)
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {expanded ? (
                  <>
                    Show less
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    +{plan.features.length - maxFeatures!} more
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            </li>
          )}
        </ul>
      </div>

      {!isSelect && (
        <Button
          size="default"
          variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
          className="w-full mt-auto font-medium"
          disabled={isCurrent || isEnterprise}
          onClick={(e) => {
            e.stopPropagation()
            props.onCheckout(plan.key, billingCycle)
          }}
        >
          {isCurrent ? 'Current Plan' : isEnterprise ? 'Contact us' : 'Choose Plan'}
        </Button>
      )}
    </>
  )

  if (isSelect) {
    return (
      <button
        type="button"
        onClick={() => props.onSelect(plan.key)}
        className={cn(
          'flex flex-col p-5 rounded-xl border-2 text-left transition-all hover:shadow-md',
          isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40'
        )}
      >
        {cardContent}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-6 space-y-5 relative flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow',
        isCurrent ? 'border-primary ring-2 ring-primary/20' : plan.popular ? 'border-primary/50' : 'border-border'
      )}
    >
      {cardContent}
    </div>
  )
}
