import { useState } from 'react'
import { ShieldCheck, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { DEFAULT_PRIVACY_SETTINGS } from '../data'
import type { ErasureRequest, ErasureStatus } from '../typings'

// ─── Constants ─────────────────────────────────────────────────────────────────

const RETENTION_OPTIONS = [
  { value: '1yr',     label: '1 Year'  },
  { value: '2yr',     label: '2 Years' },
  { value: '5yr',     label: '5 Years' },
  { value: 'forever', label: 'Forever' },
]

const ERASURE_STATUS_CLASSES: Record<ErasureStatus, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
}

const ERASURE_STATUS_LABELS: Record<ErasureStatus, string> = {
  pending:    'Pending',
  processing: 'Processing',
  completed:  'Completed',
}

// ─── Toggle Button ─────────────────────────────────────────────────────────────

function ToggleButton({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
        enabled ? 'bg-primary' : 'bg-muted-foreground/30'
      )}
      aria-pressed={enabled}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PrivacySection() {
  const [retention, setRetention] = useState(DEFAULT_PRIVACY_SETTINGS.dataRetention)
  const [cookies, setCookies]     = useState(DEFAULT_PRIVACY_SETTINGS.cookieConsent)
  const [erasureRequests, setErasureRequests] = useState<ErasureRequest[]>(
    DEFAULT_PRIVACY_SETTINGS.erasureRequests
  )
  const [erasureEmail, setErasureEmail] = useState('')

  const setRetentionValue = (key: keyof typeof retention) => (val: string) => {
    setRetention((prev) => ({ ...prev, [key]: val }))
  }

  const toggleCookie = (key: keyof typeof cookies) => {
    setCookies((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveRetention = () => {
    toast.success('Data retention settings saved')
  }

  const handleExportPersonalData = () => {
    toast.success('Export requested. You will receive an email when ready.')
  }

  const handleSubmitErasure = () => {
    const email = erasureEmail.trim()
    if (!email) {
      toast.error('Enter an email address.')
      return
    }
    if (!email.includes('@')) {
      toast.error('Enter a valid email address.')
      return
    }
    const newRequest: ErasureRequest = {
      id:            `er${Date.now()}`,
      email,
      dateSubmitted: new Date().toISOString().slice(0, 10),
      status:        'pending',
    }
    setErasureRequests((prev) => [newRequest, ...prev])
    setErasureEmail('')
    toast.success('Erasure request submitted')
  }

  return (
    <div className="space-y-6">
      {/* 1. GDPR/CCPA Status */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription className="mt-1">
                Your workspace is configured for GDPR and CCPA compliance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
              <ShieldCheck className="h-3 w-3 mr-1" />
              GDPR Ready
            </Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
              <ShieldCheck className="h-3 w-3 mr-1" />
              CCPA Compliant
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 2. Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>Configure how long data is retained before automatic deletion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              { key: 'contacts' as const, label: 'Contacts' },
              { key: 'leads'    as const, label: 'Leads'    },
              { key: 'deals'    as const, label: 'Deals'    },
            ] as { key: keyof typeof retention; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">Retain {label.toLowerCase()} data for the selected period</p>
              </div>
              <Select value={retention[key]} onValueChange={setRetentionValue(key)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETENTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={handleSaveRetention}>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* 3. Cookie Consent */}
      <Card>
        <CardHeader>
          <CardTitle>Cookie Consent</CardTitle>
          <CardDescription>Manage which cookie categories are enabled for your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 py-1">
            <div>
              <p className="text-sm font-medium">Analytics Cookies</p>
              <p className="text-xs text-muted-foreground">Used to analyze usage patterns</p>
            </div>
            <ToggleButton
              enabled={cookies.analytics}
              onToggle={() => toggleCookie('analytics')}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-1">
            <div>
              <p className="text-sm font-medium">Marketing Cookies</p>
              <p className="text-xs text-muted-foreground">Used for targeted advertising</p>
            </div>
            <ToggleButton
              enabled={cookies.marketing}
              onToggle={() => toggleCookie('marketing')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Export all personal data stored for GDPR data subject requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportPersonalData}>
            <Download className="h-4 w-4 mr-1.5" />
            Export All Personal Data
          </Button>
        </CardContent>
      </Card>

      {/* 5. Right to Erasure */}
      <Card>
        <CardHeader>
          <CardTitle>Right to Erasure</CardTitle>
          <CardDescription>
            Submit a data erasure request for an individual. Their data will be permanently removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Submit form */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="erasure-email">Email Address</Label>
              <Input
                id="erasure-email"
                type="email"
                placeholder="user@example.com"
                value={erasureEmail}
                onChange={(e) => setErasureEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitErasure() }}
              />
            </div>
            <Button onClick={handleSubmitErasure}>Submit Erasure Request</Button>
          </div>

          {/* Erasure requests table */}
          {erasureRequests.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date Submitted</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {erasureRequests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{req.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{req.dateSubmitted}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium',
                          ERASURE_STATUS_CLASSES[req.status]
                        )}>
                          {ERASURE_STATUS_LABELS[req.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
