import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Zap, Check, ChevronRight, ChevronLeft, Plus, X,
  Users, Target, TrendingUp, BarChart3, Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/context'
import { ROUTES } from '@/router/routes'
import { onboardingApi } from '@/api/auth'
import { pricingApi } from '@/api/pricing'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { PlanId } from '@/auth/types'
import type { ApiPricingPlan } from '@/api/types'
import { PlanCard } from '@/components/common/PlanCard'

const ROLE_TO_API: Record<string, string> = {
  Admin: 'admin',
  Manager: 'manager',
  'Sales Rep': 'sales-rep',
  Marketing: 'marketing',
  Viewer: 'viewer',
}

const API_TO_ROLE: Record<string, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  'sales-rep': 'Sales Rep',
  marketing: 'Marketing',
  viewer: 'Viewer',
}

const STEPS = [
  { id: 1, label: 'Workspace' },
  { id: 2, label: 'Your Role' },
  { id: 3, label: 'Invite Team' },
  { id: 4, label: 'Choose Plan' },
  { id: 5, label: 'Done' },
]

const GOALS = [
  'Track sales pipeline',
  'Manage leads & prospects',
  'Nurture customer relationships',
  'Collaborate with my team',
  'Run marketing campaigns',
  'Analyze revenue & performance',
]

const REFERRAL_SOURCES = [
  'Google / Search',
  'LinkedIn',
  'Twitter / X',
  'A friend or colleague',
  'Blog or article',
  'Product Hunt',
  'Other',
]

const MEMBER_ROLES = ['Admin', 'Manager', 'Sales Rep', 'Marketing', 'Viewer']

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Step 1: Workspace ──────────────────────────────────────────────────────

interface WorkspaceData {
  name: string
  slug: string
}

function StepWorkspace({
  data,
  onChange,
  slugAvailable,
  slugChecking,
}: {
  data: WorkspaceData
  onChange: (key: keyof WorkspaceData, val: string) => void
  slugAvailable: boolean | null
  slugChecking: boolean
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Set up your workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This is your team's home in CRM Tool. You can change these settings later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">Workspace Name</Label>
          <Input
            id="ws-name"
            value={data.name}
            onChange={(e) => {
              onChange('name', e.target.value)
              onChange('slug', slugify(e.target.value))
            }}
            placeholder="Acme Inc."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Workspace URL</Label>
          <div className="flex items-center rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
            <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r select-none whitespace-nowrap">
              app.crmtool.io/
            </span>
            <input
              className="flex-1 px-3 py-2 text-sm bg-transparent outline-none min-w-0"
              value={data.slug}
              onChange={(e) => onChange('slug', slugify(e.target.value))}
              placeholder="acme-inc"
            />
          </div>
          {data.slug && (
            <p className={cn('text-xs text-muted-foreground', slugChecking ? 'animate-pulse' : slugAvailable === true ? 'text-green-500' : slugAvailable === false ? 'text-red-500' : null)}>
              {slugChecking ? 'Checking...' : slugAvailable === true ? '✓ Available' : slugAvailable === false ? '✗ Already taken' : null}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Role & Goals ───────────────────────────────────────────────────

interface RoleData {
  jobTitle: string
  goals: string[]
  referral: string
}

function StepRole({
  data,
  onChange,
  onToggleGoal,
}: {
  data: RoleData
  onChange: (key: 'jobTitle' | 'referral', val: string) => void
  onToggleGoal: (goal: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Tell us about yourself</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll personalize your experience based on your answers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="job-title">Job Title</Label>
          <Input
            id="job-title"
            value={data.jobTitle}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            placeholder="e.g. Sales Manager"
          />
        </div>

        <div className="space-y-2">
          <Label>
            What are your primary goals?{' '}
            <span className="text-muted-foreground font-normal">(select all that apply)</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOALS.map((goal) => {
              const selected = data.goals.includes(goal)
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => onToggleGoal(goal)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-lg border text-left text-sm transition-colors',
                    selected
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'h-4 w-4 rounded flex items-center justify-center shrink-0 border transition-colors',
                    selected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                  )}>
                    {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  {goal}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>How did you hear about us?</Label>
          <Select value={data.referral} onValueChange={(v) => onChange('referral', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Invite Team ────────────────────────────────────────────────────

interface TeamInvite {
  id: number
  email: string
  role: string
}

function StepTeam({
  invites,
  setInvites,
}: {
  invites: TeamInvite[]
  setInvites: React.Dispatch<React.SetStateAction<TeamInvite[]>>
}) {
  const addRow = () => {
    if (invites.length >= 5) return
    setInvites((prev) => [...prev, { id: Date.now(), email: '', role: 'Sales Rep' }])
  }

  const removeRow = (id: number) => setInvites((prev) => prev.filter((i) => i.id !== id))

  const updateRow = (id: number, key: 'email' | 'role', val: string) => {
    setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: val } : i)))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Invite your team</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add colleagues to your workspace. You can always invite more people later.
        </p>
      </div>

      <div className="space-y-3">
        {invites.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No invites added yet.</p>
            <p className="text-xs text-muted-foreground mt-0.5">You can skip this step and invite people later.</p>
          </div>
        )}

        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center gap-2">
            <Input
              className="flex-1 min-w-0"
              type="email"
              placeholder="colleague@company.com"
              value={invite.email}
              onChange={(e) => updateRow(invite.id, 'email', e.target.value)}
            />
            <Select value={invite.role} onValueChange={(v) => updateRow(invite.id, 'role', v)}>
              <SelectTrigger className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => removeRow(invite.id)}
              className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {invites.length < 5 && (
          <Button variant="outline" size="sm" onClick={addRow} type="button">
            <Plus className="h-4 w-4 mr-1.5" />
            Add team member
          </Button>
        )}
      </div>
    </div>
  )
}

type BillingCycle = 'monthly' | 'yearly'

// ─── Step 4: Choose Plan ────────────────────────────────────────────────────

function StepPlan({
  plans,
  selected,
  onSelect,
  billingCycle,
  onBillingCycleChange,
  isLoading,
}: {
  plans: ApiPricingPlan[]
  selected: PlanId
  onSelect: (plan: PlanId) => void
  billingCycle: BillingCycle
  onBillingCycleChange: (cycle: BillingCycle) => void
  isLoading: boolean
}) {
  const hasPaidPlans = plans.some((p) => (p.price_monthly ?? 0) > 0 || (p.price_yearly ?? 0) > 0)

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Choose your plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Loading plans...</p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Choose your plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Unable to load plans. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Choose your plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Start free and upgrade anytime. No credit card required for Free.
        </p>
      </div>

      {hasPaidPlans && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted text-sm">
            <button
              type="button"
              onClick={() => onBillingCycleChange('monthly')}
              className={cn(
                'px-4 py-2 rounded-md transition-all font-medium',
                billingCycle === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onBillingCycleChange('yearly')}
              className={cn(
                'px-4 py-2 rounded-md transition-all font-medium flex items-center gap-2',
                billingCycle === 'yearly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Save 17%</Badge>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            billingCycle={billingCycle}
            variant="select"
            selected={selected === plan.key}
            onSelect={(key) => onSelect(key as PlanId)}
            maxFeatures={4}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Step 5: Done ───────────────────────────────────────────────────────────

const FEATURE_HIGHLIGHTS = [
  {
    icon: Target,
    title: 'Smart Lead Management',
    description: 'Capture, score, and convert leads with AI-powered insights.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
  {
    icon: TrendingUp,
    title: 'Visual Sales Pipeline',
    description: 'Drag-and-drop Kanban board to move deals through every stage.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description: 'Track performance, forecast revenue, and spot growth trends.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
]

function StepDone({
  workspaceName,
  billingCycle,
  onFinish,
  planName,
}: {
  workspaceName: string
  billingCycle: BillingCycle
  onFinish: (billingCycle: BillingCycle) => void
  planName: string
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          {workspaceName ? `${workspaceName} is ready!` : "You're all set!"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Starting on the{' '}
          <span className="font-semibold text-foreground">{planName}</span> plan.
          {planName === 'Free' ? ' Time to explore your dashboard.' : ' Time to proceed to checkout.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-left">
        {FEATURE_HIGHLIGHTS.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className={cn('flex items-start gap-3 p-3.5 rounded-lg', f.bg)}>
              <div className="mt-0.5 shrink-0">
                <Icon className={cn('h-5 w-5', f.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <Button className="w-full" size="lg" onClick={() => onFinish(billingCycle)}>
        {planName === 'Free' ? 'Go to Dashboard' : 'Proceed to Checkout'}
        <ChevronRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  )
}

// ─── Main Onboarding Wizard ─────────────────────────────────────────────────

const SLUG_DEBOUNCE_MS = 400

/** Shared promise to avoid duplicate start() calls when React Strict Mode double-invokes effects */
let startPromise: ReturnType<typeof onboardingApi.start> | null = null

export default function Onboarding() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, onboardingComplete } = useAuth()
  const { onboardingToken, setOnboardingToken } = useOnboardingStore()
  const [step, setStep] = useState(1)
  const [stepLoading, setStepLoading] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [workspace, setWorkspace] = useState<WorkspaceData>({ name: '', slug: '' })
  const [roleData, setRoleData] = useState<RoleData>({ jobTitle: '', goals: [], referral: '' })
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('professional')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const res = await pricingApi.getPlans()
      return res.data
    },
  })

  // Start onboarding on mount (shared promise prevents duplicate calls in React Strict Mode)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) return
    if (isLoading || !isAuthenticated) return

    if (!startPromise) {
      startPromise = onboardingApi.start()
    }

    let cancelled = false
    startPromise
      .then((res) => {
        if (cancelled) return
        const data = res.data
        setOnboardingToken(data.onboarding_token)
        setStartError(null)
        if (data.workspace_name) {
          setWorkspace({ name: data.workspace_name, slug: data.workspace_slug ?? slugify(data.workspace_name) })
          setSlugAvailable(true)
        }
        if (data.job_title) setRoleData((r) => ({ ...r, jobTitle: data.job_title! }))
        if (data.goals?.length) setRoleData((r) => ({ ...r, goals: data.goals! }))
        if (data.pending_invites?.length) {
          setInvites(data.pending_invites.map((p, i) => ({
            id: Date.now() + i,
            email: p.email,
            role: API_TO_ROLE[p.role_name] ?? 'Viewer',
          })))
        }
        if (data.selected_plan && ['free', 'basic', 'professional', 'premium', 'enterprise'].includes(data.selected_plan)) {
          setSelectedPlan(data.selected_plan as PlanId)
        }
        const completed = data.completed_steps ?? []
        if (completed.includes('plan')) setStep(5)
        else if (completed.includes('team')) setStep(4)
        else if (completed.includes('role')) setStep(3)
        else if (completed.includes('workspace')) setStep(2)
      })
      .catch(() => {
        if (!cancelled) {
          setStartError('Failed to start onboarding. Please try again.')
        }
      })
      .finally(() => {
        startPromise = null
      })

    return () => {
      cancelled = true
    }
  }, [isLoading, isAuthenticated, setOnboardingToken])

  // Debounced slug check
  const checkSlug = useCallback((slug: string) => {
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current)
    if (!slug.trim()) {
      setSlugAvailable(null)
      return
    }
    setSlugChecking(true)
    slugDebounceRef.current = setTimeout(() => {
      onboardingApi
        .slugCheck(slug)
        .then((res) => setSlugAvailable(res.data.available))
        .catch(() => setSlugAvailable(false))
        .finally(() => setSlugChecking(false))
      slugDebounceRef.current = null
    }, SLUG_DEBOUNCE_MS)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  // Redirect if already completed
  useEffect(() => {
    if (!isLoading && onboardingComplete === true) {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [isLoading, onboardingComplete, navigate])

  const updateWorkspace = (key: keyof WorkspaceData, val: string) => {
    setWorkspace((prev) => {
      const next = { ...prev, [key]: val }
      if (key === 'slug') checkSlug(next.slug)
      return next
    })
  }

  const updateRoleData = (key: 'jobTitle' | 'referral', val: string) =>
    setRoleData((prev) => ({ ...prev, [key]: val }))
  const toggleGoal = (goal: string) =>
    setRoleData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }))

  const canProceed = step === 1 ? workspace.name.trim().length > 0 && workspace.slug.trim().length > 0 && slugAvailable === true : true

  async function handleNext() {
    setStepLoading(true)
    try {
      if (step === 1) {
        await onboardingApi.updateWorkspace({
          workspace_name: workspace.name.trim(),
          workspace_slug: workspace.slug.trim(),
        })
      }
      if (step === 2 && (roleData.jobTitle || roleData.goals.length > 0)) {
        await onboardingApi.updateRole({
          job_title: roleData.jobTitle || undefined,
          goals: roleData.goals,
        })
      }
      if (step === 3 && invites.some((i) => i.email.trim())) {
        await onboardingApi.sendInvites({
          invites: invites
            .filter((i) => i.email.trim())
            .map((i) => ({ email: i.email.trim(), role_name: ROLE_TO_API[i.role] ?? 'viewer' })),
        })
      }
      if (step === 4) {
        await onboardingApi.updatePlan({ selected_plan: selectedPlan })
      }
      if (step < STEPS.length) setStep(step + 1)
    } catch {
      // Keep user on current step on error
    } finally {
      setStepLoading(false)
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  const isLastStep = step === STEPS.length

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="flex flex-col w-full lg:w-[54%] min-h-screen bg-background">
        {/* Logo */}
        <div className="px-8 sm:px-12 pt-8 shrink-0">
          <Link to="/login" className="inline-flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">CRM Tool</span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="w-full pt-6 pb-2 shrink-0">
          <div className="flex items-start w-full px-8 sm:px-12">
            {STEPS.map((s, idx) => (
              <div key={s.id} className={`flex items-center min-w-0 ${idx === STEPS.length - 1 ? '' : 'flex-1'}`}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0',
                      step > s.id
                        ? 'bg-primary text-primary-foreground'
                        : step === s.id
                          ? 'bg-primary/10 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium hidden sm:block text-center',
                      step === s.id ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 mb-4 transition-colors',
                      step > s.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto px-8 sm:px-12 py-4">
          <div className={`w-full mx-auto ${step === 4 ? '' : 'max-w-lg'}`}>
            {(isLoading || (!onboardingToken && !startError && isAuthenticated)) && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {isLoading ? 'Loading...' : 'Starting onboarding...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Checking your session' : 'This usually takes a moment'}
                </p>
              </div>
            )}
            {startError && (
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {startError}
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-destructive/30 bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-fit"
                >
                  Login again
                </Link>
              </div>
            )}
            {onboardingToken && step === 1 && (
              <StepWorkspace
                data={workspace}
                onChange={updateWorkspace}
                slugAvailable={slugAvailable}
                slugChecking={slugChecking}
              />
            )}
            {onboardingToken && step === 2 && (
              <StepRole data={roleData} onChange={updateRoleData} onToggleGoal={toggleGoal} />
            )}
            {onboardingToken && step === 3 && (
              <StepTeam invites={invites} setInvites={setInvites} />
            )}
            {onboardingToken && step === 4 && (
              <StepPlan
                plans={plans}
                selected={selectedPlan}
                onSelect={setSelectedPlan}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
                isLoading={plansLoading}
              />
            )}
            {onboardingToken && step === 5 && (
              <StepDone
                workspaceName={workspace.name}
                billingCycle={billingCycle}
                onFinish={(cycle) => navigate(ROUTES.ONBOARDING_COMPLETE, { state: { billingCycle: cycle } })}
                planName={plans.find((p) => p.key === selectedPlan)?.name ?? selectedPlan}
              />
            )}
          </div>
        </div>

        {/* Navigation footer — hidden on final step or when loading */}
        {onboardingToken && !isLastStep && (
          <div className="px-8 sm:px-12 pb-8 pt-4 flex items-center justify-between gap-3 border-t shrink-0">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step >= 2 && step <= 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleNext}
                  disabled={stepLoading}
                >
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} disabled={!canProceed || stepLoading} className="gap-1">
                {stepLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {step === 4 ? 'Finishing...' : 'Continuing...'}
                  </>
                ) : (
                  <>
                    {step === 4 ? 'Finish Setup' : 'Continue'}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Panel ── */}
      <div className="hidden lg:flex lg:w-[46%] lg:h-screen lg:sticky lg:top-0 shrink-0 relative overflow-hidden bg-linear-to-br from-blue-50 via-indigo-100 to-indigo-200 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-800">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-300/30 dark:bg-blue-500/10 blur-3xl" />

        {/* Floating app screenshot */}
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="w-[92%] h-[76%] -mr-8 rounded-l-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] border border-white/70 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 -rotate-2">
            <img
              src="/contacts-light.png"
              alt="CRM App Preview"
              className="w-full h-full object-cover object-top-left dark:hidden"
              draggable={false}
            />
            <img
              src="/contacts-dark.png"
              alt="CRM App Preview"
              className="w-full h-full object-cover object-top-left hidden dark:block"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
