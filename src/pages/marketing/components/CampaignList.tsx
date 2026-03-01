import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, Copy, Play, Pause, Plus, Mail, MessageSquare, Share2, Shuffle, ChevronsUpDown, Check, FileText, Clock, Send } from 'lucide-react'
import { DatePicker } from '@/components/common/DatePicker'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { Campaign, CampaignStatus, CampaignType } from '../typings'
import {
  CAMPAIGN_STATUS_CONFIG,
  CAMPAIGN_TYPE_CONFIG,
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  MOCK_TEMPLATES,
  AUDIENCE_LEADS,
} from '../data'
import { getOpenRate, getClickRate, formatCount } from '../utils'
import { useAuth } from '@/auth/context'

// ─── Metric pill ──────────────────────────────────────────────────────────────

function MetricPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn('text-sm font-semibold tabular-nums', highlight && 'text-[oklch(var(--success))]')}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

// ─── Audience Selector ────────────────────────────────────────────────────────

interface AudienceSelectorProps {
  audienceAll: boolean
  setAudienceAll: (v: boolean) => void
  selectedLeads: string[]
  setSelectedLeads: (v: string[]) => void
}

function AudienceSelector({ audienceAll, setAudienceAll, selectedLeads, setSelectedLeads }: AudienceSelectorProps) {
  const [open, setOpen] = useState(false)

  const label = audienceAll
    ? 'All Leads'
    : selectedLeads.length === 0
      ? 'Select audience…'
      : `${selectedLeads.length} lead${selectedLeads.length !== 1 ? 's' : ''} selected`

  const toggleLead = (id: string, checked: boolean) => {
    setSelectedLeads(checked ? [...selectedLeads, id] : selectedLeads.filter((l) => l !== id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn('w-full justify-between font-normal', !audienceAll && selectedLeads.length === 0 && 'text-muted-foreground')}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        {/* All Leads toggle */}
        <div className="border-b p-2">
          <label className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 select-none">
            <Checkbox
              checked={audienceAll}
              onCheckedChange={(checked) => {
                setAudienceAll(!!checked)
                if (checked) setSelectedLeads([])
              }}
            />
            <div>
              <p className="text-sm font-medium">All Leads</p>
              <p className="text-xs text-muted-foreground">Target entire leads database</p>
            </div>
            {audienceAll && <Check className="ml-auto h-4 w-4 text-primary shrink-0" />}
          </label>
        </div>
        {/* Individual leads */}
        <div className="p-1.5">
          <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Specific Leads</p>
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {AUDIENCE_LEADS.map((lead) => {
              const checked = !audienceAll && selectedLeads.includes(lead.id)
              return (
                <label
                  key={lead.id}
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 select-none',
                    audienceAll && 'opacity-40 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={audienceAll}
                    onCheckedChange={(c) => {
                      if (!audienceAll) {
                        setAudienceAll(false)
                        toggleLead(lead.id, !!c)
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── New Campaign Dialog ──────────────────────────────────────────────────────

type SendOption = 'draft' | 'schedule' | 'send'

const SEND_OPTIONS: { value: SendOption; label: string; icon: React.ElementType }[] = [
  { value: 'draft', label: 'Save as Draft', icon: FileText },
  { value: 'schedule', label: 'Schedule', icon: Clock },
  { value: 'send', label: 'Send Now', icon: Send },
]

const SUBMIT_LABELS: Record<SendOption, string> = {
  draft: 'Save as Draft',
  schedule: 'Schedule Campaign',
  send: 'Send Campaign',
}

function NewCampaignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<CampaignType>('email')
  const [templateId, setTemplateId] = useState('none')
  const [body, setBody] = useState('')
  const [audienceAll, setAudienceAll] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [sendOption, setSendOption] = useState<SendOption>('draft')
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    if (id !== 'none') {
      const tpl = MOCK_TEMPLATES.find((t) => t.id === id)
      if (tpl) setBody(tpl.preview)
    }
  }

  const handleClose = () => {
    setName('')
    setType('email')
    setTemplateId('none')
    setBody('')
    setAudienceAll(true)
    setSelectedLeads([])
    setSendOption('draft')
    setScheduleDate(undefined)
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (sendOption === 'schedule' && !scheduleDate) return

    const audienceSummary = audienceAll
      ? 'All Leads'
      : `${selectedLeads.length} lead${selectedLeads.length !== 1 ? 's' : ''}`

    if (sendOption === 'draft') {
      toast.success('Campaign saved as draft', {
        description: `"${name}" is ready to edit before sending.`,
      })
    } else if (sendOption === 'schedule') {
      toast.success('Campaign scheduled', {
        description: `"${name}" will be sent on ${format(scheduleDate!, 'MMM d, yyyy')} to ${audienceSummary}.`,
      })
    } else {
      toast.success('Campaign sent!', {
        description: `"${name}" is now sending to ${audienceSummary}.`,
      })
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
            <DialogDescription>Set up a new marketing campaign.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="campName">Campaign Name *</Label>
              <Input
                id="campName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q2 Product Launch"
                required
              />
            </div>

            {/* Type + Template */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="campType">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as CampaignType)}>
                  <SelectTrigger id="campType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campTemplate">Template</Label>
                <Select value={templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="campTemplate"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {MOCK_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="grid gap-2">
              <Label>Target Audience</Label>
              <AudienceSelector
                audienceAll={audienceAll}
                setAudienceAll={setAudienceAll}
                selectedLeads={selectedLeads}
                setSelectedLeads={setSelectedLeads}
              />
            </div>

            {/* Body */}
            <div className="grid gap-2">
              <Label htmlFor="campBody">Campaign Body</Label>
              <textarea
                id="campBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={7}
                placeholder={`Hi {{first_name}},\n\nWe're excited to share...\n\nBest,\n{{sender_name}}`}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{{first_name}}"}</code>, <code className="bg-muted px-1 rounded">{"{{company}}"}</code> as merge tags.</p>
            </div>

            {/* Send Options */}
            <div className="grid gap-2">
              <Label>Send Options</Label>
              <div className="grid grid-cols-3 gap-2">
                {SEND_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSendOption(value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-sm transition-all',
                      sendOption === value
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', sendOption === value ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-xs font-medium leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>
              {sendOption === 'schedule' && (
                <div className="mt-1 grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Scheduled Date *</Label>
                  <DatePicker
                    value={scheduleDate}
                    onChange={setScheduleDate}
                    placeholder="Pick a send date"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={sendOption === 'schedule' && !scheduleDate}>
              {SUBMIT_LABELS[sendOption]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Campaign Dialog ─────────────────────────────────────────────────────

function EditCampaignDialog({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<CampaignType>('email')
  const [status, setStatus] = useState<CampaignStatus>('draft')
  const [audienceAll, setAudienceAll] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [body, setBody] = useState('')

  useEffect(() => {
    if (campaign) {
      setName(campaign.name)
      setType(campaign.type)
      setStatus(campaign.status)
      setBody('')
      setAudienceAll(true)
      setSelectedLeads([])
    }
  }, [campaign])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Campaign updated', { description: `"${name}" has been updated.` })
    onClose()
  }

  return (
    <Dialog open={!!campaign} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update your campaign details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="editCampName">Campaign Name *</Label>
              <Input
                id="editCampName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editCampType">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as CampaignType)}>
                  <SelectTrigger id="editCampType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editCampStatus">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as CampaignStatus)}>
                  <SelectTrigger id="editCampStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="grid gap-2">
              <Label>Target Audience</Label>
              <AudienceSelector
                audienceAll={audienceAll}
                setAudienceAll={setAudienceAll}
                selectedLeads={selectedLeads}
                setSelectedLeads={setSelectedLeads}
              />
            </div>

            {/* Body */}
            <div className="grid gap-2">
              <Label htmlFor="editCampBody">Campaign Body</Label>
              <textarea
                id="editCampBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={7}
                placeholder={`Hi {{first_name}},\n\n...`}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Campaign Dialog ────────────────────────────────────────────────────

function DeleteCampaignDialog({ campaign, open, onOpenChange }: {
  campaign: Campaign | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  if (!campaign) return null
  const handleDelete = () => {
    toast.error('Campaign deleted', { description: `"${campaign.name}" has been removed.` })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{campaign.name}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function CampaignRowActions({ campaign, onEdit }: { campaign: Campaign; onEdit: (c: Campaign) => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { can } = useAuth()
  const canEditCampaign = can('marketing.edit')
  const canCreateCampaign = can('marketing.create')
  const canSend = can('marketing.send')
  const canDeleteCampaign = can('marketing.delete')
  const hasWriteAccess = canEditCampaign || canCreateCampaign || canSend || canDeleteCampaign

  const statusCanPause = campaign.status === 'active'
  const statusCanResume = campaign.status === 'paused'

  if (!hasWriteAccess) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEditCampaign && (
            <DropdownMenuItem onClick={() => onEdit(campaign)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Campaign
            </DropdownMenuItem>
          )}
          {canCreateCampaign && (
            <DropdownMenuItem onClick={() => toast.success('Campaign duplicated', { description: `"${campaign.name}" has been duplicated as a draft.` })}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          )}
          {canSend && statusCanPause && (
            <DropdownMenuItem onClick={() => toast.info('Campaign paused', { description: `"${campaign.name}" has been paused.` })}>
              <Pause className="h-4 w-4 mr-2" />
              Pause Campaign
            </DropdownMenuItem>
          )}
          {canSend && statusCanResume && (
            <DropdownMenuItem onClick={() => toast.success('Campaign resumed', { description: `"${campaign.name}" is now active.` })}>
              <Play className="h-4 w-4 mr-2" />
              Resume Campaign
            </DropdownMenuItem>
          )}
          {canDeleteCampaign && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCampaignDialog campaign={campaign} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}

// ─── Column builder ───────────────────────────────────────────────────────────

function buildColumns(onEdit: (c: Campaign) => void): ColumnDef<Campaign, unknown>[] {
  return [
    {
      id: 'name',
      accessorFn: (row) => `${row.name} ${row.targetAudience}`,
      header: 'Campaign',
      size: 280,
      cell: ({ row }) => {
        const c = row.original
        const TypeIcon = { email: Mail, sms: MessageSquare, social: Share2, 'multi-channel': Shuffle }[c.type]
        return (
          <div className="flex items-start gap-2.5">
            <TypeIcon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug line-clamp-1">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.targetAudience}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      filterFn: 'equals',
      size: 130,
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs gap-1">
          {CAMPAIGN_TYPE_CONFIG[row.original.type].label}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: 'equals',
      size: 120,
      cell: ({ row }) => {
        const cfg = CAMPAIGN_STATUS_CONFIG[row.original.status]
        return (
          <Badge variant="outline" className={cn('text-xs font-medium gap-1.5', cfg.className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      id: 'metrics',
      header: 'Performance',
      size: 220,
      enableSorting: false,
      cell: ({ row }) => {
        const m = row.original.metrics
        const openRate = getOpenRate(m)
        const clickRate = getClickRate(m)
        if (m.sent === 0) {
          return <span className="text-xs text-muted-foreground">Not started</span>
        }
        return (
          <div className="flex items-center gap-4">
            <MetricPill label="Sent" value={formatCount(m.sent)} />
            <MetricPill label="Open" value={`${openRate}%`} highlight={openRate >= 25} />
            <MetricPill label="Click" value={`${clickRate}%`} highlight={clickRate >= 10} />
            {m.converted > 0 && <MetricPill label="Conv." value={String(m.converted)} />}
          </div>
        )
      },
    },
    {
      id: 'dates',
      header: 'Dates',
      size: 160,
      enableSorting: false,
      cell: ({ row }) => {
        const { startDate, endDate } = row.original
        if (!startDate) return <span className="text-sm text-muted-foreground">—</span>
        return (
          <div>
            <p className="text-xs text-muted-foreground">{startDate}</p>
            {endDate && <p className="text-xs text-muted-foreground/60">→ {endDate}</p>}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      size: 50,
      enableSorting: false,
      cell: ({ row }) => <CampaignRowActions campaign={row.original} onEdit={onEdit} />,
    },
  ]
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const [newOpen, setNewOpen] = useState(false)
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null)
  const { can } = useAuth()

  const columns = useMemo(() => buildColumns(setEditCampaign), [])

  return (
    <>
      <DataTable
        columns={columns}
        data={campaigns}
        searchPlaceholder="Search campaigns..."
        toolbar={(table) => (
          <>
            <Select
              value={(table.getColumn('status')?.getFilterValue() as CampaignStatus | undefined) ?? 'all'}
              onValueChange={(val) => {
                table.getColumn('status')?.setFilterValue(val === 'all' ? undefined : val)
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn('type')?.getFilterValue() as CampaignType | undefined) ?? 'all'}
              onValueChange={(val) => {
                table.getColumn('type')?.setFilterValue(val === 'all' ? undefined : val)
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-[145px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {can('marketing.create') && (
              <Button size="sm" onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                New Campaign
              </Button>
            )}
          </>
        )}
        emptyMessage="No campaigns found"
        emptyDescription="Create your first campaign to start reaching your audience."
      />
      <NewCampaignDialog open={newOpen} onOpenChange={setNewOpen} />
      <EditCampaignDialog campaign={editCampaign} onClose={() => setEditCampaign(null)} />
    </>
  )
}
