import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { NOTIFICATION_PREFS, NOTIFICATION_EVENTS } from '../data'
import type { NotificationPrefs, NotificationKey } from '../typings'

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(NOTIFICATION_PREFS)

  const handleChange = (key: NotificationKey, channel: 'email' | 'inApp', val: boolean) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: val },
    }))
  }

  const handleSave = () => {
    toast.success('Notification preferences saved')
  }

  const allEmail = NOTIFICATION_EVENTS.every((e) => prefs[e.key].email)
  const allInApp = NOTIFICATION_EVENTS.every((e) => prefs[e.key].inApp)

  const toggleAllEmail = () => {
    const next = !allEmail
    setPrefs((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [k, { ...v, email: next }])
      ) as NotificationPrefs
    )
  }

  const toggleAllInApp = () => {
    const next = !allInApp
    setPrefs((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [k, { ...v, inApp: next }])
      ) as NotificationPrefs
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you want to be notified about activity in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
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
                      aria-label={`Email for ${event.label}`}
                    />
                  </td>
                  <td className="py-3 text-center">
                    <Checkbox
                      checked={prefs[event.key].inApp}
                      onCheckedChange={(v) => handleChange(event.key, 'inApp', v as boolean)}
                      aria-label={`In-app for ${event.label}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={handleSave}>Save Preferences</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>Receive a summary of your workspace activity by email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['Daily digest at 8:00 AM', 'Weekly summary on Mondays', 'Never'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="digest"
                defaultChecked={opt === 'Daily digest at 8:00 AM'}
                className="accent-primary"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={() => toast.success('Email digest preference saved')}>
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
