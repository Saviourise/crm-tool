import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/auth/context'
import { DEMO_USERS } from '@/auth/demo-users'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  'super-admin': 'Super Admin',
  'admin': 'Admin',
  'manager': 'Manager',
  'sales-rep': 'Sales Rep',
  'marketing': 'Marketing',
  'viewer': 'Viewer',
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
  enterprise: 'Enterprise',
}

const PLAN_BADGE_CLASSES: Record<string, string> = {
  free: 'bg-muted text-muted-foreground border-border',
  basic: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  professional: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
  premium: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoOpen, setDemoOpen] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error ?? 'Invalid email or password.')
    }
  }

  async function loginAsDemo(demoEmail: string, demoPassword: string) {
    setError('')
    setLoading(true)
    setEmail(demoEmail)
    setPassword(demoPassword)
    const result = await login(demoEmail, demoPassword)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error ?? 'Login failed.')
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Card */}
        <div className="bg-background border rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">CRM Tool</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-1">Sign in to your account</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={cn('pr-10', error && 'border-destructive focus-visible:ring-destructive')}
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
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline underline-offset-2 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="bg-background border rounded-2xl shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setDemoOpen(!demoOpen)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold hover:bg-muted/50 transition-colors"
          >
            <span>Demo Accounts</span>
            {demoOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {demoOpen && (
            <div className="px-6 pb-6 space-y-3">
              <p className="text-xs text-muted-foreground -mt-1 mb-3">
                Click any card to instantly log in as that demo user.
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_USERS.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0', u.avatarColor)}>
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {ROLE_LABELS[u.role] ?? u.role}
                          </Badge>
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4', PLAN_BADGE_CLASSES[u.plan])}>
                            {PLAN_LABELS[u.plan]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs h-8"
                      disabled={loading}
                      onClick={() => loginAsDemo(u.email, u.password)}
                    >
                      Log in as
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
