import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail, MessageSquare, CalendarDays, Zap, Phone, CreditCard, Building2,
  CheckCircle2, Circle, ExternalLink, Globe, MessageCircle, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { integrationsApi } from '@/api/integrations'
import type { ApiIntegration, WebhookConfig } from '@/api/integrations'
import { FirefliesIntegrationCard } from './FirefliesIntegrationCard'

const INTEGRATIONS_QUERY_KEY = ['integrations', 'list'] as const
const WEBHOOK_QUERY_KEY      = ['integrations', 'webhook'] as const

// ─── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Mail:          Mail,
  MessageSquare: MessageSquare,
  MessageCircle: MessageCircle,
  CalendarDays:  CalendarDays,
  Zap:           Zap,
  Phone:         Phone,
  CreditCard:    CreditCard,
  Building2:     Building2,
  Globe:         Globe,
}

// ─── Webhook config ────────────────────────────────────────────────────────────

const WEBHOOK_EVENTS = [
  { value: 'lead.created',       label: 'Lead Created' },
  { value: 'lead.updated',       label: 'Lead Updated' },
  { value: 'contact.created',    label: 'Contact Created' },
  { value: 'contact.updated',    label: 'Contact Updated' },
  { value: 'deal.stage_changed', label: 'Deal Stage Changed' },
  { value: 'deal.closed_won',    label: 'Deal Closed (Won)' },
  { value: 'task.completed',     label: 'Task Completed' },
  { value: 'campaign.launched',  label: 'Campaign Launched' },
]

function WebhookConfigDialog({
  open, url, events, isSaving, onClose, onSave,
}: {
  open: boolean
  url: string
  events: string[]
  isSaving: boolean
  onClose: () => void
  onSave: (url: string, events: string[]) => void
}) {
  const [localUrl, setLocalUrl]       = useState(url)
  const [localEvents, setLocalEvents] = useState<string[]>(events)

  const handleOpen = (v: boolean) => {
    if (v) {
      setLocalUrl(url)
      setLocalEvents(events)
    } else {
      onClose()
    }
  }

  const toggle = (value: string) =>
    setLocalEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    )

  const handleTest = () => {
    if (!localUrl.trim()) { toast.error('Enter an endpoint URL first.'); return }
    toast.success('Test event sent — check your endpoint logs.')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Webhooks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-server.com/webhooks"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We will POST a signed JSON payload to this URL when subscribed events occur.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Events to Subscribe</Label>
            <div className="grid grid-cols-2 gap-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={localEvents.includes(event.value)}
                    onCheckedChange={() => toggle(event.value)}
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleTest}>
            Send Test Event
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            disabled={!localUrl.trim() || localEvents.length === 0 || isSaving}
            onClick={() => onSave(localUrl.trim(), localEvents)}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Integration Card ──────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isBusy,
}: {
  integration: ApiIntegration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  isBusy: boolean
}) {
  const Icon = ICON_MAP[integration.icon_name] ?? Circle
  const connected = integration.status === 'connected'

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border hover:bg-muted/20 transition-colors">
      <div className={cn(
        'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
        connected ? 'bg-primary/10' : 'bg-muted'
      )}>
        <Icon className={cn('h-5 w-5', connected ? 'text-primary' : 'text-muted-foreground')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{integration.name}</p>
              <Badge variant="secondary" className="text-xs">{integration.category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{integration.description}</p>
          </div>
        </div>
        {connected && integration.connected_account && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connected as <span className="font-medium">{integration.connected_account}</span>
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant={connected ? 'outline' : 'default'}
            className={cn('h-7 text-xs', connected && 'text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30')}
            disabled={isBusy}
            onClick={() => connected ? onDisconnect(integration.id) : onConnect(integration.id)}
          >
            {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : connected ? 'Disconnect' : 'Connect'}
          </Button>
          {connected && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1"
              onClick={() => toast.success(`Opening ${integration.name} settings...`)}
            >
              <ExternalLink className="h-3 w-3" />
              Settings
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function IntegrationSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border">
      <div className="h-10 w-10 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
        <div className="h-3 w-64 rounded bg-muted animate-pulse" />
        <div className="h-7 w-20 rounded bg-muted animate-pulse mt-3" />
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function IntegrationsSection() {
  const queryClient = useQueryClient()
  const [busyId, setBusyId]                       = useState<string | null>(null)
  const [webhookConfigOpen, setWebhookConfigOpen] = useState(false)

  // Integrations list
  const { data, isLoading } = useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn:  () => integrationsApi.list(),
  })

  const integrations = data?.data?.results ?? []
  const connected    = integrations.filter((i) => i.status === 'connected')
  const available    = integrations.filter((i) => i.status === 'disconnected')

  // Webhook config
  const { data: webhookData, isLoading: isLoadingWebhook } = useQuery({
    queryKey: WEBHOOK_QUERY_KEY,
    queryFn:  () => integrationsApi.getWebhook(),
  })

  const webhookUrl    = webhookData?.data?.url ?? ''
  const webhookEvents = webhookData?.data?.subscribed_events ?? []

  // Mutations
  const { mutate: connect } = useMutation({
    mutationFn: (id: string) => integrationsApi.connect(id),
    onMutate:   (id) => setBusyId(id),
    onSuccess:  (res) => {
      toast.success(`${res.data.name} connected`)
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
    },
    onError:    () => toast.error('Failed to connect integration'),
    onSettled:  () => setBusyId(null),
  })

  const { mutate: disconnect } = useMutation({
    mutationFn: (id: string) => integrationsApi.disconnect(id),
    onMutate:   (id) => setBusyId(id),
    onSuccess:  (_, id) => {
      const integration = integrations.find((i) => i.id === id)
      toast.success(`${integration?.name ?? 'Integration'} disconnected`)
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
    },
    onError:    () => toast.error('Failed to disconnect integration'),
    onSettled:  () => setBusyId(null),
  })

  const { mutate: saveWebhook, isPending: isSavingWebhook } = useMutation({
    mutationFn: (config: WebhookConfig) => integrationsApi.saveWebhook(config),
    onSuccess:  () => {
      toast.success('Webhook configuration saved')
      queryClient.invalidateQueries({ queryKey: WEBHOOK_QUERY_KEY })
      setWebhookConfigOpen(false)
    },
    onError: () => toast.error('Failed to save webhook configuration'),
  })

  return (
    <div className="space-y-6">
      <FirefliesIntegrationCard />

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect your favorite tools to streamline your workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <IntegrationSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <>
          {connected.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Connected</CardTitle>
                    <CardDescription>Active integrations syncing with your workspace.</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {connected.length} active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {connected.map((i) => (
                  <IntegrationCard
                    key={i.id}
                    integration={i}
                    onConnect={connect}
                    onDisconnect={disconnect}
                    isBusy={busyId === i.id}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {available.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
                <CardDescription>Connect your favorite tools to streamline your workflow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {available.map((i) => (
                  <IntegrationCard
                    key={i.id}
                    integration={i}
                    onConnect={connect}
                    onDisconnect={disconnect}
                    isBusy={busyId === i.id}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>
            Receive real-time events from the CRM to your external services.
            {webhookEvents.length > 0 && (
              <span className="ml-1 text-foreground font-medium">
                {webhookEvents.length} event{webhookEvents.length !== 1 ? 's' : ''} subscribed.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingWebhook ? (
            <div className="h-9 rounded-lg bg-muted animate-pulse" />
          ) : webhookUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 font-mono text-xs text-muted-foreground">
              <span className="flex-1 truncate">{webhookUrl}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl).catch(() => {})
                  toast.success('Webhook URL copied to clipboard')
                }}
              >
                Copy
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No webhook endpoint configured.</p>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWebhookConfigOpen(true)}
          >
            Configure Webhooks
          </Button>
        </CardContent>
      </Card>

      <WebhookConfigDialog
        open={webhookConfigOpen}
        url={webhookUrl}
        events={webhookEvents}
        isSaving={isSavingWebhook}
        onClose={() => setWebhookConfigOpen(false)}
        onSave={(url, events) => saveWebhook({ url, subscribed_events: events })}
      />
    </div>
  )
}
