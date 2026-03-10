import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Zap, CheckCircle } from 'lucide-react'
import { onboardingApi } from '@/api/auth'
import { useOnboardingStore } from '@/store/onboardingStore'
import { ROUTES } from '@/router/routes'

const POLL_INTERVAL_MS = 3000

const ACTIVATING_STEPS = [
  'Payment confirmed',
  'Activating your workspace',
  'Preparing your dashboard',
]

export default function OnboardingPaymentSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { setOnboardingToken } = useOnboardingStore()
  const [status, setStatus] = useState<'polling' | 'active' | 'failed'>('polling')
  const [error, setError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid payment session. Please try again.')
      return
    }

    // Restore onboarding token for status poll (saved before Stripe redirect)
    const savedToken = localStorage.getItem('onboarding_token') ?? sessionStorage.getItem('onboarding_token')
    if (savedToken) {
      setOnboardingToken(savedToken)
    } else {
      setError('Session expired. Please sign in to continue.')
      return
    }

    let cancelled = false
    let pollTimeout: ReturnType<typeof setTimeout> | null = null

    const pollStatus = async () => {
      if (cancelled) return
      try {
        const res = await onboardingApi.status()
        if (cancelled) return
        const { provision_status } = res.data

        if (provision_status === 'active') {
          setOnboardingToken(null)
          localStorage.removeItem('onboarding_token')
          sessionStorage.removeItem('onboarding_token')
          setStatus('active')
          return
        }

        if (provision_status === 'failed') {
          setError('Workspace setup failed. Please contact support.')
          setStatus('failed')
          return
        }

        if (provision_status === 'pending_payment' || provision_status === 'provisioning') {
          pollTimeout = setTimeout(pollStatus, POLL_INTERVAL_MS)
        }
      } catch {
        if (!cancelled) pollTimeout = setTimeout(pollStatus, POLL_INTERVAL_MS)
      }
    }

    pollStatus()

    return () => {
      cancelled = true
      if (pollTimeout) clearTimeout(pollTimeout)
    }
  }, [sessionId, setOnboardingToken])

  // No session_id — show error immediately (avoid flash of loader)
  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl text-destructive font-bold">!</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Invalid session</h1>
            <p className="text-sm text-muted-foreground mt-2">Please complete your payment or try again.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.ONBOARDING}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to onboarding
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Cycle through step messages so user sees all three
  useEffect(() => {
    if (error || status !== 'polling') return
    const id = setInterval(() => {
      setStepIndex((i) => (i < ACTIVATING_STEPS.length - 1 ? i + 1 : 0))
    }, 2000)
    return () => clearInterval(id)
  }, [error, status])

  if (error || status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl text-destructive font-bold">!</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mt-2">{error ?? 'Payment failed.'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.ONBOARDING}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to onboarding
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'active') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Payment complete!</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your workspace is ready. Sign in to access your dashboard.
            </p>
          </div>
          <Link
            to="/login"
            state={{ from: { pathname: ROUTES.DASHBOARD } }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  // Polling state — same layout and loader as onboarding complete
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-sm w-full text-center space-y-20">
        <Link to="/login" className="inline-flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">CRM Tool</span>
        </Link>

        <div className="space-y-12">
          <div className="flex justify-center">
            <div className="loader origin-center" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {ACTIVATING_STEPS[Math.min(stepIndex, ACTIVATING_STEPS.length - 1)]}
            </p>
            <p className="text-xs text-muted-foreground">This usually takes a few seconds</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {ACTIVATING_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted transition-all duration-500"
                style={{
                  backgroundColor: i <= stepIndex ? 'hsl(var(--primary))' : undefined,
                  opacity: i <= stepIndex ? 1 : 0.3,
                  transform: i === stepIndex ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
