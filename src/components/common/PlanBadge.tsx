import { Badge } from '@/components/ui/badge'
import type { PlanId } from '@/auth/types'

const PLAN_STYLES: Record<PlanId, string> = {
  free:         'bg-muted text-muted-foreground border-border',
  basic:        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  professional: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  premium:      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
  enterprise:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
}

const PLAN_NAMES: Record<PlanId, string> = {
  free:         'Free',
  basic:        'Basic',
  professional: 'Professional',
  premium:      'Premium',
  enterprise:   'Enterprise',
}

export function PlanBadge({ plan }: { plan: PlanId }) {
  return (
    <Badge variant="outline" className={`text-xs ${PLAN_STYLES[plan]}`}>
      {PLAN_NAMES[plan]}
    </Badge>
  )
}
