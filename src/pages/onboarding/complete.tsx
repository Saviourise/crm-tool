import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { onboardingApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/auth/context'
import { useOnboardingStore } from '@/store/onboardingStore'
import { ROUTES } from '@/router/routes'

const POLL_INTERVAL_MS = 3000

/** Shared promise to avoid duplicate complete() calls when React Strict Mode double-invokes effects */
let completePromise: ReturnType<typeof onboardingApi.complete> | null = null

const COMPLETING_STEPS = [
  'Setting up your workspace',
  'Configuring your plan',
  'Preparing your dashboard',
]

export default function OnboardingComplete() {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()
  const { setTokens } = useAuthStore()
  const { setOnboardingToken } = useOnboardingStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let pollTimeout: ReturnType<typeof setTimeout> | null = null

    if (!completePromise) {
      completePromise = onboardingApi.complete()
    }

    completePromise
      .then((res) => {
        if (cancelled) return
        const data = res.data
        setTokens(data.access, data.refresh)

        if (data.workspace.provision_status === 'active') {
          const wsId = (data.workspace as { id?: string }).id
          if (wsId) setTokens(data.access, data.refresh, wsId)
          setOnboardingToken(null)
          completeOnboarding()
          navigate(ROUTES.DASHBOARD, { replace: true, state: { fromOnboarding: true } })
          return
        }

        if (data.workspace.provision_status === 'failed') {
          setError('Workspace setup failed. Please contact support.')
          return
        }

        // provisioning — poll until active or failed
        const pollStatus = async () => {
          if (cancelled) return
          try {
            const statusRes = await onboardingApi.status()
            if (cancelled) return
            const status = statusRes.data.provision_status
            const ws = statusRes.data.workspace
            if (status === 'active' && ws) {
              setTokens(useAuthStore.getState().accessToken!, useAuthStore.getState().refreshToken!, ws.id)
              setOnboardingToken(null)
              completeOnboarding()
              navigate(ROUTES.DASHBOARD, { replace: true, state: { fromOnboarding: true } })
            } else if (status === 'failed') {
              setError('Workspace setup failed. Please contact support.')
            } else {
              pollTimeout = setTimeout(pollStatus, POLL_INTERVAL_MS)
            }
          } catch {
            if (!cancelled) pollTimeout = setTimeout(pollStatus, POLL_INTERVAL_MS)
          }
        }
        pollTimeout = setTimeout(pollStatus, POLL_INTERVAL_MS)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to complete setup. Please try again.')
      })
      .finally(() => {
        completePromise = null
      })

    return () => {
      cancelled = true
      if (pollTimeout) clearTimeout(pollTimeout)
    }
  }, [navigate, setTokens, setOnboardingToken, completeOnboarding])

  // Cycle through step messages so user sees all three
  useEffect(() => {
    if (error) return
    const id = setInterval(() => {
      setStepIndex((i) => (i < COMPLETING_STEPS.length - 1 ? i + 1 : 0))
    }, 2000)
    return () => clearInterval(id)
  }, [error])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl text-destructive font-bold">!</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
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
              Login again
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
              {COMPLETING_STEPS[Math.min(stepIndex, COMPLETING_STEPS.length - 1)]}
            </p>
            <p className="text-xs text-muted-foreground">This usually takes a few seconds</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {COMPLETING_STEPS.map((_, i) => (
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
