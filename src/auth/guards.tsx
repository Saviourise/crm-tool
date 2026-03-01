import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Permission, Feature, PlanId } from './types'
import { useAuth } from './context'
import { Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/router/routes'

// ─── RequireAuth — redirect to /login if not authenticated ───────────────────
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

// ─── RequirePermission — shows AccessDenied if user lacks permission ─────────
export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) {
    return fallback ? <>{fallback}</> : <AccessDenied />
  }
  return <>{children}</>
}

// ─── RequireFeature — shows UpgradePrompt if plan doesn't include feature ────
export function RequireFeature({
  feature,
  children,
  fallback,
  inline,
}: {
  feature: Feature
  children: ReactNode
  fallback?: ReactNode
  inline?: boolean
}) {
  const { hasPlan } = useAuth()
  if (!hasPlan(feature)) {
    return fallback ? <>{fallback}</> : <UpgradePrompt feature={feature} inline={inline} />
  }
  return <>{children}</>
}

// ─── UpgradePrompt ────────────────────────────────────────────────────────────
const FEATURE_PLAN_MAP: Record<Feature, PlanId> = {
  companies: 'basic', pipeline: 'basic', calendar: 'basic',
  communication: 'basic', 'csv-import': 'basic',
  marketing: 'professional', reports: 'professional',
  'multi-pipeline': 'professional', 'pipeline-filters': 'professional',
  'custom-fields': 'professional',
  'ai-content': 'professional', 'ai-sentiment': 'professional', 'ai-lead-scoring': 'professional',
  'ai-social': 'premium', 'ai-voice': 'premium', 'ai-chat': 'premium', 'ai-suggestions': 'premium',
  automation: 'premium', 'lead-routing': 'premium', 'audit-log': 'premium',
  sso: 'enterprise', privacy: 'enterprise',
}

const PLAN_NAMES: Record<PlanId, string> = {
  free: 'Free', basic: 'Basic', professional: 'Professional', premium: 'Premium', enterprise: 'Enterprise',
}

function UpgradePrompt({ feature, inline }: { feature: Feature; inline?: boolean }) {
  const navigate = useNavigate()
  const requiredPlan = FEATURE_PLAN_MAP[feature] ?? 'professional'

  if (inline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        <span>Requires <strong>{PLAN_NAMES[requiredPlan]}</strong> plan.</span>
        <button
          onClick={() => navigate(`${ROUTES.SETTINGS}?section=billing`)}
          className="text-primary underline underline-offset-2 hover:no-underline font-medium"
        >
          Upgrade
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Upgrade Required</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          This feature requires the <strong>{PLAN_NAMES[requiredPlan]}</strong> plan or higher.
        </p>
      </div>
      <Button onClick={() => navigate(`${ROUTES.SETTINGS}?section=billing`)}>
        <Zap className="h-4 w-4 mr-2" />
        View Plans
      </Button>
    </div>
  )
}

// ─── AccessDenied ─────────────────────────────────────────────────────────────
export function AccessDenied() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <Lock className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Access Denied</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          You don't have permission to view this page. Contact your administrator.
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>
        Go to Dashboard
      </Button>
    </div>
  )
}
