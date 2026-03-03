import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSubmitted(true)
  }

  function handleTryAnother() {
    setSubmitted(false)
    setEmail('')
    setError('')
  }

  return (
    <AuthLayout>
      {!submitted ? (
        <>
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Reset your password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send you a verification code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Check your email</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. Check your inbox.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full"
              onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`)}
            >
              Continue to verification
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleTryAnother}>
              Try a different email
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}
