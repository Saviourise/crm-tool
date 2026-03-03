import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Zap, Check, ChevronRight, ChevronLeft, Plus, X,
  Users, Target, TrendingUp, BarChart3, Loader2,
  Shield, Sparkles, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/context'
import { ROUTES } from '@/router/routes'
import type { PlanId } from '@/auth/types'

const ONBOARDING_KEY = 'crm_onboarding_complete'

const STEPS = [
  { id: 1, label: 'Workspace' },
  { id: 2, label: 'Your Role' },
  { id: 3, label: 'Invite Team' },
  { id: 4, label: 'Choose Plan' },
  { id: 5, label: 'Done' },
]

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Real Estate',
  'Retail & E-commerce',
  'Professional Services',
  'Manufacturing',
  'Education',
  'Media & Entertainment',
  'Other',
]

const COMPANY_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
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

interface PlanOption {
  id: PlanId
  label: string
  price: string
  period: string
  description: string
  features: string[]
  icon: React.ElementType
  highlight?: boolean
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['Up to 250 contacts', 'Basic lead management', 'Task tracking', '1 user'],
    icon: Zap,
  },
  {
    id: 'basic',
    label: 'Basic',
    price: '$9',
    period: 'per user / mo',
    description: 'For small teams',
    features: ['Unlimited contacts', 'Pipeline & companies', 'Calendar & communication', 'CSV import'],
    icon: Building2,
  },
  {
    id: 'professional',
    label: 'Professional',
    price: '$29',
    period: 'per user / mo',
    description: 'For growing teams',
    features: ['Everything in Basic', 'Marketing campaigns', 'Revenue reports', 'AI content tools', 'Multi-pipeline'],
    icon: TrendingUp,
    highlight: true,
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '$79',
    period: 'per user / mo',
    description: 'For scaling businesses',
    features: ['Everything in Pro', 'AI Voice & Chat agents', 'Automation workflows', 'Lead routing', 'Audit log'],
    icon: Sparkles,
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For large organizations',
    features: ['Everything in Premium', 'SSO & SCIM', 'GDPR/CCPA tools', 'Dedicated support', 'SLA guarantee'],
    icon: Shield,
  },
]

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
  industry: string
  size: string
}

function StepWorkspace({
  data,
  onChange,
}: {
  data: WorkspaceData
  onChange: (key: keyof WorkspaceData, val: string) => void
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Select value={data.industry} onValueChange={(v) => onChange('industry', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Company Size</Label>
            <Select value={data.size} onValueChange={(v) => onChange('size', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

// ─── Step 4: Choose Plan ────────────────────────────────────────────────────

function StepPlan({
  selected,
  onSelect,
}: {
  selected: PlanId
  onSelect: (plan: PlanId) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Choose your plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Start free and upgrade anytime. No credit card required for Free.
        </p>
      </div>

      <div className="space-y-2">
        {PLAN_OPTIONS.map((plan) => {
          const Icon = plan.icon
          const isSelected = selected === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={cn(
                'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              {/* Selection dot */}
              <div className={cn(
                'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                isSelected ? 'border-primary' : 'border-muted-foreground/40'
              )}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('font-semibold text-sm', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                    {plan.label}
                  </span>
                  {plan.highlight && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Most Popular
                    </span>
                  )}
                  <span className="ml-auto text-sm font-bold text-foreground">
                    {plan.price}
                    {plan.price !== 'Custom' && (
                      <span className="text-xs font-normal text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                  {plan.features.map((f) => (
                    <span key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
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
  selectedPlan,
  onFinish,
  loading,
}: {
  workspaceName: string
  selectedPlan: PlanId
  onFinish: () => void
  loading: boolean
}) {
  const plan = PLAN_OPTIONS.find((p) => p.id === selectedPlan)

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
          <span className="font-semibold text-foreground">{plan?.label}</span> plan.
          Time to explore your dashboard.
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

      <Button className="w-full" size="lg" onClick={onFinish} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Setting up your workspace...
          </>
        ) : (
          <>
            Go to Dashboard
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </>
        )}
      </Button>
    </div>
  )
}

// ─── Main Onboarding Wizard ─────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Redirect if already completed
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [navigate])

  // Step 1 data
  const [workspace, setWorkspace] = useState<WorkspaceData>({
    name: '', slug: '', industry: '', size: '',
  })
  const updateWorkspace = (key: keyof WorkspaceData, val: string) =>
    setWorkspace((prev) => ({ ...prev, [key]: val }))

  // Step 2 data
  const [roleData, setRoleData] = useState<RoleData>({ jobTitle: '', goals: [], referral: '' })
  const updateRoleData = (key: 'jobTitle' | 'referral', val: string) =>
    setRoleData((prev) => ({ ...prev, [key]: val }))
  const toggleGoal = (goal: string) =>
    setRoleData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }))

  // Step 3 data
  const [invites, setInvites] = useState<TeamInvite[]>([])

  // Step 4 data
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('professional')

  const canProceed = step === 1 ? workspace.name.trim().length > 0 : true

  function handleNext() {
    if (step < STEPS.length) setStep(step + 1)
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  async function handleFinish() {
    setLoading(true)
    // Simulate workspace provisioning
    await new Promise((r) => setTimeout(r, 1200))
    // Auto-login with the admin demo account to enter the app
    const result = await login('admin@demo.com', 'demo1234')
    if (result.success) {
      localStorage.setItem(ONBOARDING_KEY, 'true')
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
    setLoading(false)
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
          <div className="max-w-lg w-full mx-auto">
            {step === 1 && (
              <StepWorkspace data={workspace} onChange={updateWorkspace} />
            )}
            {step === 2 && (
              <StepRole data={roleData} onChange={updateRoleData} onToggleGoal={toggleGoal} />
            )}
            {step === 3 && (
              <StepTeam invites={invites} setInvites={setInvites} />
            )}
            {step === 4 && (
              <StepPlan selected={selectedPlan} onSelect={setSelectedPlan} />
            )}
            {step === 5 && (
              <StepDone
                workspaceName={workspace.name}
                selectedPlan={selectedPlan}
                onFinish={handleFinish}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Navigation footer — hidden on final step */}
        {!isLastStep && (
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
                >
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} disabled={!canProceed} className="gap-1">
                {step === 4 ? 'Finish Setup' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
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
