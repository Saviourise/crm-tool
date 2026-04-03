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
import { cn } from '@/lib/utils'
import { integrationsApi } from '@/api/integrations'
import type { ApiIntegration } from '@/api/integrations'
import { FirefliesIntegrationCard } from './FirefliesIntegrationCard'

const INTEGRATIONS_QUERY_KEY = ['integrations', 'list'] as const

// ─── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Mail: Mail,
  MessageSquare: MessageSquare,
  MessageCircle: MessageCircle,
  CalendarDays: CalendarDays,
  Zap: Zap,
  Phone: Phone,
  CreditCard: CreditCard,
  Building2: Building2,
  Globe: Globe,
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
            {isBusy ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : connected ? 'Disconnect' : 'Connect'}
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
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: () => integrationsApi.list(),
  })

  const integrations = data?.data?.results ?? []
  const connected = integrations.filter((i) => i.status === 'connected')
  const available = integrations.filter((i) => i.status === 'disconnected')

  const { mutate: connect } = useMutation({
    mutationFn: (id: string) => integrationsApi.connect(id),
    onMutate: (id) => setBusyId(id),
    onSuccess: (res) => {
      toast.success(`${res.data.name} connected`)
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
    },
    onError: () => toast.error('Failed to connect integration'),
    onSettled: () => setBusyId(null),
  })

  const { mutate: disconnect } = useMutation({
    mutationFn: (id: string) => integrationsApi.disconnect(id),
    onMutate: (id) => setBusyId(id),
    onSuccess: (_, id) => {
      const integration = integrations.find((i) => i.id === id)
      toast.success(`${integration?.name ?? 'Integration'} disconnected`)
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
    },
    onError: () => toast.error('Failed to disconnect integration'),
    onSettled: () => setBusyId(null),
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

    </div>
  )
}
