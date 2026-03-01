import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPasswordStrength } from '../utils'
import { cn } from '@/lib/utils'

function PasswordInput({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function PasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const strength = getPasswordStrength(next)
  const mismatch = confirm.length > 0 && next !== confirm
  const canSave = current.length > 0 && next.length >= 8 && next === confirm

  const handleSave = () => {
    toast.success('Password updated successfully')
    setCurrent('')
    setNext('')
    setConfirm('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Choose a strong password. We recommend at least 12 characters with a mix of letters, numbers, and symbols.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasswordInput
            id="current-password"
            label="Current Password"
            value={current}
            onChange={setCurrent}
          />
          <PasswordInput
            id="new-password"
            label="New Password"
            hint="Minimum 8 characters."
            value={next}
            onChange={setNext}
          />

          {/* Strength meter */}
          {next.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      strength.score >= i ? strength.color : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="text-xs text-muted-foreground">
                  Strength: <span className="font-medium text-foreground">{strength.label}</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn(mismatch && 'border-rose-400 focus-visible:ring-rose-400')}
            />
            {mismatch && (
              <p className="text-xs text-rose-500">Passwords do not match.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={handleSave} disabled={!canSave}>
            Update Password
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'At least 8 characters',
              'At least one uppercase letter (A–Z)',
              'At least one number (0–9)',
              'At least one special character (!@#$%...)',
            ].map((req) => (
              <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
