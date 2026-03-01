import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PlanId } from '@/auth/types'

const PLANS: { id: PlanId; label: string; price: string }[] = [
  { id: 'free', label: 'Free', price: '$0' },
  { id: 'basic', label: 'Basic', price: '$9' },
  { id: 'professional', label: 'Professional', price: '$29' },
  { id: 'premium', label: 'Premium', price: '$79' },
  { id: 'enterprise', label: 'Enterprise', price: 'Custom' },
]

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: '', width: '0%' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' }
  if (score === 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' }
  if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: '75%' }
  return { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
}

export default function Signup() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('professional')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const strength = getPasswordStrength(password)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.'
    if (!workEmail.trim()) newErrors.workEmail = 'Email is required.'
    if (!company.trim()) newErrors.company = 'Company name is required.'
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.'
    if (!agreedToTerms) newErrors.terms = 'You must agree to the Terms of Service.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast.success('Account created! Please sign in.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">CRM Tool</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-1">Create your account</h1>
        <p className="text-muted-foreground text-sm mb-6">Get started for free. No credit card required.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={cn(errors.fullName && 'border-destructive')}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* Work Email */}
          <div className="space-y-1.5">
            <Label htmlFor="workEmail">Work Email</Label>
            <Input
              id="workEmail"
              type="email"
              placeholder="jane@company.com"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className={cn(errors.workEmail && 'border-destructive')}
            />
            {errors.workEmail && <p className="text-xs text-destructive">{errors.workEmail}</p>}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={cn(errors.company && 'border-destructive')}
            />
            {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn('pr-10', errors.password && 'border-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', strength.color)}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength: <span className="font-medium text-foreground">{strength.label}</span>
                </p>
              </div>
            )}
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn('pr-10', errors.confirmPassword && 'border-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          {/* Plan selection */}
          <div className="space-y-1.5">
            <Label>Select a Plan</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-2 rounded-lg border text-center transition-all',
                    selectedPlan === plan.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-xs font-semibold leading-tight">{plan.label}</span>
                  <span className="text-[10px] leading-tight">{plan.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground leading-snug">
                I agree to the{' '}
                <span className="text-primary underline underline-offset-2 cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary underline underline-offset-2 cursor-pointer">Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline underline-offset-2 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
