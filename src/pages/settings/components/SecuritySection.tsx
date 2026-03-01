import { useState } from 'react'
import {
  Monitor, Smartphone, Tablet, Key, Plus, Copy, Trash2, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SESSIONS, API_KEYS } from '../data'
import type { Session, ApiKey, SessionDevice } from '../typings'
import { cn } from '@/lib/utils'

// ─── SSO Settings Card ─────────────────────────────────────────────────────────

function SSOSettingsCard() {
  const [ssoEnabled, setSsoEnabled] = useState(false)
  const [idpUrl, setIdpUrl] = useState('')
  const [entityId, setEntityId] = useState('')
  const [certificate, setCertificate] = useState('')

  const acsCallbackUrl = 'https://crm.example.com/sso/acs'

  const handleCopyAcs = () => {
    navigator.clipboard.writeText(acsCallbackUrl).catch(() => { })
    toast.success('ACS callback URL copied to clipboard')
  }

  const handleTestConnection = () => {
    if (!idpUrl.trim()) {
      toast.error('Enter the Identity Provider URL first.')
      return
    }
    const success = Math.random() > 0.3
    if (success) {
      toast.success('SSO connection test successful.')
    } else {
      toast.error('SSO connection test failed. Check your IdP URL and certificate.')
    }
  }

  const handleSaveSSO = () => {
    toast.success('SSO settings saved')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SSO / SAML Settings</CardTitle>
        <CardDescription>Single Sign-On via SAML 2.0 identity provider</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle row */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
          <div>
            <p className="text-sm font-medium">Enable SSO</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Allow team members to sign in using your identity provider.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSsoEnabled((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0',
              ssoEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
            aria-pressed={ssoEnabled}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                ssoEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Collapsible config — shown when SSO is enabled */}
        {ssoEnabled && (
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="sso-idp-url">Identity Provider URL</Label>
              <Input
                id="sso-idp-url"
                placeholder="https://idp.yourcompany.com/sso/saml"
                value={idpUrl}
                onChange={(e) => setIdpUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sso-entity-id">Entity ID</Label>
              <Input
                id="sso-entity-id"
                placeholder="https://crm.example.com"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sso-certificate">X.509 Certificate</Label>
              <textarea
                id="sso-certificate"
                rows={4}
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sso-acs">ACS Callback URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sso-acs"
                  value={acsCallbackUrl}
                  readOnly
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={handleCopyAcs}>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configure this URL as the ACS (Assertion Consumer Service) URL in your IdP.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleTestConnection}>
                Test SSO Connection
              </Button>
              <Button size="sm" onClick={handleSaveSSO}>
                Save SSO Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Device icon ───────────────────────────────────────────────────────────────

const DEVICE_ICONS: Record<SessionDevice, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
}

// ─── Create API Key Dialog ─────────────────────────────────────────────────────

const ALL_SCOPES = [
  { value: 'contacts:read', label: 'Contacts — Read' },
  { value: 'contacts:write', label: 'Contacts — Write' },
  { value: 'leads:read', label: 'Leads — Read' },
  { value: 'leads:write', label: 'Leads — Write' },
  { value: 'reports:read', label: 'Reports — Read' },
  { value: 'pipeline:read', label: 'Pipeline — Read' },
]

function CreateKeyDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, scopes: string[]) => void
}) {
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>(['contacts:read'])

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }

  const handleClose = () => {
    setName('')
    setScopes(['contacts:read'])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              placeholder="e.g. Mobile App, Analytics Script"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Scopes</Label>
            <div className="space-y-2">
              {ALL_SCOPES.map((s) => (
                <label key={s.value} className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={scopes.includes(s.value)}
                    onCheckedChange={() => toggleScope(s.value)}
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || scopes.length === 0}
            onClick={() => {
              onCreate(name.trim(), scopes)
              handleClose()
            }}
          >
            Generate Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SecuritySection() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(SESSIONS)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(API_KEYS)
  const [createKeyOpen, setCreateKeyOpen] = useState(false)

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    toast.success('Session revoked')
  }

  const revokeAllOther = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent))
    toast.success('All other sessions revoked')
  }

  const revokeKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
    toast.error('API key revoked')
  }

  const copyKey = (prefix: string) => {
    navigator.clipboard.writeText(`${prefix}••••••••••••`).catch(() => { })
    toast.success('Key prefix copied to clipboard')
  }

  const handleCreateKey = (name: string, scopes: string[]) => {
    const newKey: ApiKey = {
      id: `k${Date.now()}`,
      name,
      prefix: `crm_live_${Math.random().toString(36).slice(2, 6)}`,
      created: 'Feb 27, 2026',
      lastUsed: 'Never',
      scopes,
    }
    setApiKeys((prev) => [...prev, newKey])
    toast.success(`API key "${name}" created`)
  }

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with a time-based one-time password (TOTP).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              {twoFaEnabled
                ? <ShieldCheck className="h-5 w-5 text-emerald-500" />
                : <ShieldOff className="h-5 w-5 text-muted-foreground" />
              }
              <div>
                <p className="text-sm font-medium">{twoFaEnabled ? '2FA is enabled' : '2FA is disabled'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {twoFaEnabled
                    ? 'Your account is protected with an authenticator app.'
                    : 'Enable 2FA to protect your account from unauthorized access.'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={twoFaEnabled ? 'outline' : 'default'}
              className={cn(twoFaEnabled && 'text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30')}
              onClick={() => {
                setTwoFaEnabled((v) => !v)
                toast.success(twoFaEnabled ? '2FA disabled' : '2FA enabled — please scan the QR code in your authenticator app')
              }}
            >
              {twoFaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Devices and browsers currently signed into your account.</CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" className="shrink-0 text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30" onClick={revokeAllOther}>
                Revoke Others
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((session) => {
            const Icon = DEVICE_ICONS[session.device]
            return (
              <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{session.browser}</p>
                    {session.isCurrent && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{session.location} · {session.ip} · {session.lastActive}</p>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 shrink-0"
                    onClick={() => revokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Keys for authenticating API requests from your applications.</CardDescription>
            </div>
            <Button size="sm" className="shrink-0" onClick={() => setCreateKeyOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiKeys.map((key) => (
            <div key={key.id} className="p-4 rounded-lg border space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{key.name}</p>
                    <p className="text-xs text-muted-foreground">Created {key.created} · Last used {key.lastUsed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyKey(key.prefix)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600"
                    onClick={() => revokeKey(key.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                  {key.prefix}••••••••••••
                </code>
              </div>
              <div className="flex flex-wrap gap-1">
                {key.scopes.map((scope) => (
                  <Badge key={scope} variant="secondary" className="text-xs">{scope}</Badge>
                ))}
              </div>
            </div>
          ))}

          {apiKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No API keys created yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateKeyDialog
        open={createKeyOpen}
        onClose={() => setCreateKeyOpen(false)}
        onCreate={handleCreateKey}
      />

      {/* SSO Settings */}
      <SSOSettingsCard />
    </div>
  )
}
