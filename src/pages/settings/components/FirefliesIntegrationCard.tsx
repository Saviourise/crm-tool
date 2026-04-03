import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Video, Copy, Check, ChevronDown, ChevronUp,
  CheckCircle2, Clock, XCircle, Briefcase, Target, User, ListTodo,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const STATUS_CONFIG: Record<MeetingImportStatus, { label: string; className: string; Icon: React.ElementType }> = {
  processing: { label: 'Processing', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800', Icon: Clock },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800', Icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800', Icon: XCircle },
}

function MeetingRow({ meeting }: { meeting: MeetingImport }) {
  const status = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.completed
  const StatusIcon = status.Icon

  const date = (() => {
    const dateSource = meeting.meeting_date || meeting.created_at
    if (!dateSource) return 'Date unavailable'

    try {
      const parsed = new Date(dateSource)
      if (Number.isNaN(parsed.getTime())) return 'Date unavailable'

      return parsed.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
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
      {meeting.status === 'failed' && meeting.error_message && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {meeting.error_message}
        </p>
      )}
    </div>
  )
}

export function FirefliesIntegrationCard() {
  const queryClient = useQueryClient()
  const [copiedField, setCopiedField] = useState<'url' | 'secret' | null>(null)
  const [latestSecret, setLatestSecret] = useState('')
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
  const meetings = meetingsData?.data?.results ?? []
  const nextCursor = getCursorFromUrl(meetingsData?.data?.next)
  const previousCursor = getCursorFromUrl(meetingsData?.data?.previous)

  const { mutate: enable, isPending: isEnabling } = useMutation({
    mutationFn: () => integrationsApi.enableFireflies(),
    onSuccess: (response) => {
      toast.success('Fireflies integration enabled')
      const secret = response.data?.secret ?? ''
      if (secret) setLatestSecret(secret)
      queryClient.invalidateQueries({ queryKey: FIREFLIES_QUERY_KEY })
    },
    onError: () => toast.error('Failed to enable Fireflies integration'),
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
      <CardHeader>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enable / Disable */}
        <div className="flex items-center gap-2">
          {enabled ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30"
              onClick={() => disable()}
              disabled={isBusy || isLoadingStatus}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => enable()}
              disabled={isBusy || isLoadingStatus}
            >
              {isEnabling ? 'Connecting…' : 'Connect'}
            </Button>
          )}
        </div>

        {/* Webhook URL — shown when enabled */}
        {enabled && webhookUrl && (
          <div className="space-y-2">
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
            <p className="text-xs text-muted-foreground">
              Paste this URL into your Fireflies dashboard under{' '}
              <span className="font-medium text-foreground">Settings → Webhooks → Add Webhook</span>.
              {webhookSecret && (
                <>
                  {' '}Use the <span className="font-medium text-foreground">Webhook Secret</span> above as the signing key/secret in Fireflies.
                </>
              )}
              {' '}Select the <span className="font-medium text-foreground">Meeting Completed</span> trigger.
            </p>
          </div>
        )}

        {/* Setup steps — shown when not yet enabled */}
        {!enabled && !isLoadingStatus && (
          <ol className="space-y-1.5 text-xs text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              Click <span className="font-medium text-foreground mx-1">Connect</span> to generate your webhook URL and secret
            </li>
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              Copy both values from this card, then open <span className="font-medium text-foreground mx-1">Fireflies → Settings → Webhooks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              Paste the webhook URL and set the webhook secret/signing key
            </li>
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
              Select the <span className="font-medium text-foreground mx-1">Meeting Completed</span> trigger, then save
            </li>
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">5</span>
              After each meeting, tasks, contacts, leads, and deals are created automatically
            </li>
          </ol>
        )}

        {/* Meeting log — shown when enabled */}
        {enabled && (
          <div className="border-t pt-3">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setShowLog((current) => {
                  const next = !current
                  if (next) setMeetingsCursor(undefined)
                  return next
                })
              }}
            >
              {showLog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Meeting Import Log
              {meetingsData?.data?.count !== undefined && (
                <span className="text-muted-foreground/60">({meetingsData.data.count})</span>
              )}
            </button>

            {showLog && (
              <div className="mt-3">
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
    </Card>
  )
}
