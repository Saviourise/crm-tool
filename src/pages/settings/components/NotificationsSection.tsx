import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { notificationPrefsApi, type EmailDigest } from '@/api/notifications'
import { NOTIFICATION_PREFS, NOTIFICATION_EVENTS } from '../data'
import type { NotificationPrefs, NotificationKey } from '../typings'

// ─── Key mapping: FE camelCase ↔ API snake_case ───────────────────────────────

const FE_TO_API: Record<NotificationKey, string> = {
  newLead: 'new_lead',
  dealStage: 'deal_stage',
  taskDue: 'task_due',
  taskOverdue: 'task_overdue',
  mention: 'mention',
  campaignLaunched: 'campaign_launched',
  reportReady: 'report_ready',
  newContact: 'new_contact',
}

const API_TO_FE: Record<string, NotificationKey> = Object.fromEntries(
  Object.entries(FE_TO_API).map(([fe, api]) => [api, fe as NotificationKey])
)

const DIGEST_OPTIONS: { value: EmailDigest; label: string }[] = [
  { value: 'daily', label: 'Daily digest at 8:00 AM' },
  { value: 'weekly', label: 'Weekly summary on Mondays' },
  { value: 'never', label: 'Never' },
]

function apiToPrefs(apiPrefs: Record<string, { email: boolean; in_app: boolean }>): NotificationPrefs {
  const result = { ...NOTIFICATION_PREFS }
  for (const [apiKey, val] of Object.entries(apiPrefs)) {
    const feKey = API_TO_FE[apiKey]
    if (feKey) result[feKey] = { email: val.email, inApp: val.in_app }
  }
  return result
}

function prefsToApi(prefs: NotificationPrefs): Record<string, { email: boolean; in_app: boolean }> {
  return Object.fromEntries(
    Object.entries(prefs).map(([feKey, val]) => [
      FE_TO_API[feKey as NotificationKey],
      { email: val.email, in_app: val.inApp },
    ])
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(NOTIFICATION_PREFS)
  const [digest, setDigest] = useState<EmailDigest>('daily')

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationPrefsApi.get().then((r) => r.data),
    retry: false,
  })

  useEffect(() => {
    if (!data) return
    setPrefs(apiToPrefs(data.preferences))
    setDigest(data.email_digest)
  }, [data])

  // ── Save ────────────────────────────────────────────────────────────────────
  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () =>
      notificationPrefsApi.update({
        preferences: prefsToApi(prefs),
        email_digest: digest,
      }),
    onSuccess: () => toast.success('Notification preferences saved'),
    onError: () => toast.error('Failed to save preferences'),
  })

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleChange = (key: NotificationKey, channel: 'email' | 'inApp', val: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: val } }))
  }

  const allEmail = NOTIFICATION_EVENTS.every((e) => prefs[e.key].email)
  const allInApp = NOTIFICATION_EVENTS.every((e) => prefs[e.key].inApp)

  const toggleAllEmail = () => {
    const next = !allEmail
    setPrefs((prev) =>
      Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, email: next }])) as NotificationPrefs
    )
  }

  const toggleAllInApp = () => {
    const next = !allInApp
    setPrefs((prev) =>
      Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, inApp: next }])) as NotificationPrefs
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you want to be notified about activity in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto px-6">
              <table className="w-full text-sm min-w-[320px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Event
                    </th>
                    <th className="text-center py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">
                      <div className="flex flex-col items-center gap-1">
                        <span>Email</span>
                        <Checkbox
                          checked={allEmail}
                          onCheckedChange={toggleAllEmail}
                          disabled={saving}
                          aria-label="Toggle all email"
                        />
                      </div>
                    </th>
                    <th className="text-center py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">
                      <div className="flex flex-col items-center gap-1">
                        <span>In-App</span>
                        <Checkbox
                          checked={allInApp}
                          onCheckedChange={toggleAllInApp}
                          disabled={saving}
                          aria-label="Toggle all in-app"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {NOTIFICATION_EVENTS.map((event) => (
                    <tr key={event.key} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      </td>
                      <td className="py-3 text-center">
                        <Checkbox
                          checked={prefs[event.key].email}
                          onCheckedChange={(v) => handleChange(event.key, 'email', v as boolean)}
                          disabled={saving}
                          aria-label={`Email for ${event.label}`}
                        />
                      </td>
                      <td className="py-3 text-center">
                        <Checkbox
                          checked={prefs[event.key].inApp}
                          onCheckedChange={(v) => handleChange(event.key, 'inApp', v as boolean)}
                          disabled={saving}
                          aria-label={`In-app for ${event.label}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" disabled={saving || isLoading} onClick={() => save()}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* Email Digest is disabled for initial release */}

      {/* <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>Receive a summary of your workspace activity by email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            DIGEST_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="digest"
                  value={opt.value}
                  checked={digest === opt.value}
                  onChange={() => setDigest(opt.value)}
                  className="accent-primary"
                  disabled={saving}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))
          )}
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" disabled={saving || isLoading} onClick={() => save()}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save
          </Button>
        </CardFooter>
      </Card> */}
    </div>
  )
}
