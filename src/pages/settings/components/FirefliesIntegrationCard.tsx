import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  Video, Copy, Check, ChevronDown, ChevronUp,
  CheckCircle2, Clock, XCircle, Briefcase, Target, User, ListTodo,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { integrationsApi } from '@/api/integrations'
import type { MeetingImport, MeetingImportStatus } from '@/api/integrations'

const FIREFLIES_QUERY_KEY = ['integrations', 'fireflies'] as const
const MEETINGS_QUERY_KEY = ['integrations', 'fireflies', 'meetings'] as const

function getCursorFromUrl(url: string | null | undefined) {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    return parsed.searchParams.get('cursor') ?? undefined
  } catch {
    return undefined
  }
}

function maskApiKey(value: string) {
  if (!value) return ''
  if (value.length <= 4) return '••••'
  return `••••••••${value.slice(-4)}`
}

const STATUS_CONFIG: Record<MeetingImportStatus, { label: string; className: string; Icon: React.ElementType }> = {
  processing: { label: 'Processing', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800', Icon: Clock },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800', Icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800', Icon: XCircle },
}

function MeetingRow({ meeting }: { meeting: MeetingImport }) {
  const status = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.completed
  const StatusIcon = status.Icon

  const date = (() => {
    const dateSource = meeting.created_at
    if (!dateSource) return 'Date unavailable'

    try {
      const parsed = new Date(dateSource)
      if (Number.isNaN(parsed.getTime())) return 'Date unavailable'
      return formatDistanceToNow(parsed, { addSuffix: true, includeSeconds: true })
    } catch {
      return 'Date unavailable'
    }
  })()

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{meeting.meeting_title || 'Untitled Meeting'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
        </div>
        <Badge variant="outline" className={cn('text-xs shrink-0 gap-1', status.className)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>
      {meeting.status === 'completed' && (
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {meeting.tasks_created > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ListTodo className="h-3 w-3" />
              {meeting.tasks_created} task{meeting.tasks_created !== 1 ? 's' : ''}
            </span>
          )}
          {meeting.contacts_created > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {meeting.contacts_created} contact{meeting.contacts_created !== 1 ? 's' : ''}
            </span>
          )}
          {meeting.leads_created > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              {meeting.leads_created} lead{meeting.leads_created !== 1 ? 's' : ''}
            </span>
          )}
          {meeting.deals_created > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {meeting.deals_created} deal{meeting.deals_created !== 1 ? 's' : ''}
            </span>
          )}
          {meeting.tasks_created === 0 && meeting.contacts_created === 0 &&
            meeting.leads_created === 0 && meeting.deals_created === 0 && (
              <span className="text-xs text-muted-foreground">No entities extracted</span>
            )}
        </div>
      )}
      {meeting.status === 'failed' && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          Failed to import meeting
        </p>
      )}
    </div>
  )
}

export function FirefliesIntegrationCard() {
  const queryClient = useQueryClient()
  const [copiedField, setCopiedField] = useState<'url' | 'secret' | null>(null)
  const [latestSecret, setLatestSecret] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showReplaceKey, setShowReplaceKey] = useState(false)
  const [isCardExpanded, setIsCardExpanded] = useState(true)
  const [showLog, setShowLog] = useState(false)
  const [meetingsCursor, setMeetingsCursor] = useState<string | undefined>(undefined)

  const { data: firefliesData, isLoading: isLoadingStatus } = useQuery({
    queryKey: FIREFLIES_QUERY_KEY,
    queryFn: () => integrationsApi.getFireflies(),
    retry: (failureCount, error: unknown) => {
      // Don't retry 404 — means not yet enabled
      if ((error as { response?: { status?: number } })?.response?.status === 404) return false
      return failureCount < 2
    },
  })

  const { data: meetingsData, isLoading: isLoadingMeetings, isFetching: isFetchingMeetings } = useQuery({
    queryKey: [...MEETINGS_QUERY_KEY, meetingsCursor ?? 'first-page'],
    queryFn: () => integrationsApi.listMeetings({ limit: 10, cursor: meetingsCursor }),
    enabled: showLog && !!firefliesData?.data?.enabled,
    refetchInterval: (query) => {
      const rows = query.state.data?.data?.results ?? []
      return rows.some((meeting) => meeting.status === 'processing') ? 5000 : false
    },
  })

  const enabled = firefliesData?.data?.enabled ?? false
  const webhookUrl = firefliesData?.data?.webhook_url ?? ''
  const webhookSecret = firefliesData?.data?.secret ?? latestSecret
  const savedApiKey = firefliesData?.data?.api_key ?? ''
  const maskedSavedApiKey = maskApiKey(savedApiKey)
  const meetings = meetingsData?.data?.results ?? []
  const nextCursor = getCursorFromUrl(meetingsData?.data?.next)
  const previousCursor = getCursorFromUrl(meetingsData?.data?.previous)
  const trimmedApiKey = apiKey.trim()
  const isStep1Complete = Boolean(savedApiKey)
  const isStep2Complete = enabled

  const { mutate: enable, isPending: isEnabling } = useMutation({
    mutationFn: (key: string) => integrationsApi.enableFireflies({ api_key: key }),
    onSuccess: (response) => {
      toast.success(enabled ? 'Fireflies API key updated' : 'Fireflies integration enabled')
      const secret = response.data?.secret ?? ''
      if (secret) setLatestSecret(secret)
      setApiKey('')
      setShowReplaceKey(false)
      queryClient.invalidateQueries({ queryKey: FIREFLIES_QUERY_KEY })
    },
    onError: () => toast.error(enabled ? 'Failed to update Fireflies API key' : 'Failed to enable Fireflies integration'),
  })

  const { mutate: disable, isPending: isDisabling } = useMutation({
    mutationFn: () => integrationsApi.disableFireflies(),
    onSuccess: () => {
      toast.success('Fireflies integration disabled')
      setLatestSecret('')
      setMeetingsCursor(undefined)
      queryClient.invalidateQueries({ queryKey: FIREFLIES_QUERY_KEY })
      queryClient.removeQueries({ queryKey: MEETINGS_QUERY_KEY })
      setShowLog(false)
    },
    onError: () => toast.error('Failed to disable Fireflies integration'),
  })

  const handleCopy = (value: string, field: 'url' | 'secret', label: string) => {
    navigator.clipboard.writeText(value).catch(() => { })
    setCopiedField(field)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000)
  }

  const isBusy = isEnabling || isDisabling

  return (
    <Card>
      <Collapsible open={isCardExpanded} onOpenChange={setIsCardExpanded}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                  enabled ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <Video className={cn('h-5 w-5', enabled ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">Fireflies AI</CardTitle>
                    <Badge variant="secondary" className="text-xs">Meetings</Badge>
                    {enabled && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-0.5">
                    Fireflies joins your meetings, captures transcripts, and automatically creates tasks, contacts, leads, and deals in your CRM after each meeting ends.
                  </CardDescription>
                </div>
                <div className="pt-0.5 text-muted-foreground">
                  {isCardExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1: Add Fireflies API Key</p>
                {isStep1Complete && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>

              {isStep1Complete && !showReplaceKey ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Saved API key: <span className="font-mono">{maskedSavedApiKey}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={() => setShowReplaceKey(true)}
                  >
                    Replace API Key
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    type="password"
                    name="fireflies_api_key_manual"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="Paste your Fireflies API key"
                    className="h-8 text-xs"
                    autoComplete="new-password"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meeting summary will not work without a Fireflies API key.
                  </p>
                  <div className="rounded-md border bg-muted/30 p-2.5 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-medium text-foreground">Acquiring a Token</p>
                    <p>1. Log in to your account at fireflies.ai</p>
                    <p>2. Navigate to the Integrations section</p>
                    <p>3. Click on Fireflies API</p>
                    <p>4. Copy and paste your API key in the input above</p>
                  </div>
                  {isStep1Complete && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      onClick={() => { setApiKey(''); setShowReplaceKey(false) }}
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2: Connect Integration</p>
                {isStep2Complete && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {enabled ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        if (!trimmedApiKey) {
                          toast.error('Enter your Fireflies API key to update it')
                          return
                        }
                        enable(trimmedApiKey)
                      }}
                      disabled={isBusy || isLoadingStatus}
                    >
                      {isEnabling ? 'Saving…' : 'Save API Key'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30"
                      onClick={() => disable()}
                      disabled={isBusy || isLoadingStatus}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      if (!trimmedApiKey) {
                        toast.error('Enter your Fireflies API key to continue')
                        return
                      }
                      enable(trimmedApiKey)
                    }}
                    disabled={isBusy || isLoadingStatus}
                  >
                    {isEnabling ? 'Connecting…' : 'Connect'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Connect to generate your webhook URL and secret for Fireflies.
              </p>
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 3: Configure Fireflies Webhook</p>
              </div>
              {enabled && webhookUrl ? (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Webhook URL</p>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border">
                    <span className="flex-1 font-mono text-xs truncate text-muted-foreground">
                      {webhookUrl}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => handleCopy(webhookUrl, 'url', 'Webhook URL')}
                      title="Copy to clipboard"
                    >
                      {copiedField === 'url' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  {webhookSecret && (
                    <>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Webhook Secret</p>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border">
                        <span className="flex-1 font-mono text-xs truncate text-muted-foreground">
                          {webhookSecret}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => handleCopy(webhookSecret, 'secret', 'Webhook secret')}
                          title="Copy to clipboard"
                        >
                          {copiedField === 'secret' ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                  <ol className="space-y-1.5 text-xs text-muted-foreground list-none">
                    <li>1. Go to <span className="font-medium text-foreground">Fireflies → Settings → Webhooks</span></li>
                    <li>2. Add webhook and paste the <span className="font-medium text-foreground">Webhook URL</span></li>
                    {webhookSecret && (
                      <li>3. Paste the <span className="font-medium text-foreground">Webhook Secret</span> as signing key/secret</li>
                    )}
                    <li>{webhookSecret ? '4' : '3'}. Select the <span className="font-medium text-foreground">Meeting Completed</span> trigger and save</li>
                  </ol>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Complete Step 2 first to generate your webhook URL and secret.
                </p>
              )}
            </div>

            {enabled && (
              <div className="rounded-lg border p-3 space-y-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    setShowLog((current) => {
                      const next = !current
                      if (next) setMeetingsCursor(undefined)
                      return next
                    })
                  }}
                >
                  {showLog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Step 4: Meeting Import Log
                  {meetingsData?.data?.count !== undefined && (
                    <span className="text-muted-foreground/60">({meetingsData.data.count})</span>
                  )}
                </button>

                {showLog && (
                  <div>
                    {isLoadingMeetings ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      </div>
                    ) : meetings.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No meetings processed yet. Fireflies will send meeting notes here after your next call.
                      </p>
                    ) : (
                      <>
                        <div className="divide-y divide-border">
                          {meetings.map((m) => (
                            <MeetingRow key={m.id} meeting={m} />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={!previousCursor || isFetchingMeetings}
                            onClick={() => setMeetingsCursor(previousCursor)}
                          >
                            Previous
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={!nextCursor || isFetchingMeetings}
                            onClick={() => setMeetingsCursor(nextCursor)}
                          >
                            Next
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
