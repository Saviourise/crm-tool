import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/router/routes'

const RESEND_COUNTDOWN = 60

type VerifyFlow = 'forgot-password' | 'signup'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const flow = (searchParams.get('flow') as VerifyFlow) ?? 'forgot-password'
  const { setTokens } = useAuthStore()

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)
    setError('')

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleVerify() {
    const code = digits.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      triggerShake()
      return
    }
    if (!email) {
      setError(flow === 'signup' ? 'Missing email. Please start from signup.' : 'Missing email. Please start from forgot password.')
      triggerShake()
      return
    }
    setLoading(true)
    setError('')
    try {
      if (flow === 'signup') {
        const res = await authApi.verifyEmail(email, code)
        setTokens(res.data.access, res.data.refresh)
        navigate(ROUTES.ONBOARDING, { replace: true })
      } else {
        await authApi.verifyOtp(email, code)
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(code)}`)
      }
    } catch {
      setError('Invalid or expired code. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  async function handleResend() {
    if (!canResend || !email) return
    setCanResend(false)
    setCountdown(RESEND_COUNTDOWN)
    setDigits(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
    try {
      if (flow === 'signup') {
        await authApi.resendSignupOtp(email)
      } else {
        await authApi.forgotPassword(email)
      }
      toast.success('A new code has been sent to your email.')
    } catch {
      toast.error('Failed to resend code. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {flow === 'signup' ? 'Verify your email' : 'Enter verification code'}
        </h1>
        {email && (
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>.
          </p>
        )}
      </div>

      {/* OTP Inputs */}
      <div
        className={cn(
          'flex gap-2 justify-center mb-2',
          shake && 'animate-[shake_0.5s_ease-in-out]'
        )}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : undefined}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              'w-11 h-13 text-center text-lg font-semibold border rounded-lg bg-background transition-all outline-none',
              'focus:ring-2 focus:ring-primary focus:border-primary',
              error
                ? 'border-destructive focus:ring-destructive focus:border-destructive'
                : 'border-input'
            )}
            style={{ width: '44px', height: '52px' }}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-destructive text-center mb-4">{error}</p>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>

      <div className="space-y-3 mt-4">
        <Button className="w-full" onClick={handleVerify} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary hover:underline underline-offset-2 font-medium"
            >
              Resend code
            </button>
          ) : (
            <span>
              Resend code in{' '}
              <span className="font-medium text-foreground tabular-nums">{countdown}s</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <Link
          to={flow === 'signup' ? '/signup' : '/login'}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {flow === 'signup' ? 'Back to signup' : 'Back to login'}
        </Link>
      </div>
    </AuthLayout>
  )
}
