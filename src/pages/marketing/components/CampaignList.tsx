import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, Copy, Play, Pause, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { Campaign, CampaignStatus, CampaignType } from '../typings'
import { CAMPAIGN_STATUS_CONFIG, CAMPAIGN_TYPE_CONFIG, CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_TYPE_OPTIONS } from '../data'
import { getOpenRate, getClickRate, formatCount } from '../utils'

// ─── Metric pill ──────────────────────────────────────────────────────────────

function MetricPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn('text-sm font-semibold tabular-nums', highlight && 'text-[oklch(var(--success))]')}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

// ─── New Campaign Dialog ──────────────────────────────────────────────────────

function NewCampaignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem('campaignName') as HTMLInputElement).value
    toast.success('Campaign created', { description: `"${name}" has been added as a draft.` })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
            <DialogDescription>Set up a new marketing campaign.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input id="campaignName" name="campaignName" placeholder="Q2 Product Launch" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="campaignType">Type</Label>
                <Select name="campaignType" defaultValue="email">
                  <SelectTrigger id="campaignType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaignAudience">Target Audience</Label>
                <Input id="campaignAudience" name="campaignAudience" placeholder="All leads" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function CampaignRowActions({ campaign }: { campaign: Campaign }) {
  const canPause = campaign.status === 'active'
  const canResume = campaign.status === 'paused'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info('Edit coming soon')}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Campaign
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success('Campaign duplicated', { description: `"${campaign.name}" has been duplicated as a draft.` })}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        {canPause && (
          <DropdownMenuItem onClick={() => toast.info('Campaign paused', { description: `"${campaign.name}" has been paused.` })}>
            <Pause className="h-4 w-4 mr-2" />
            Pause Campaign
          </DropdownMenuItem>
        )}
        {canResume && (
          <DropdownMenuItem onClick={() => toast.success('Campaign resumed', { description: `"${campaign.name}" is now active.` })}>
            <Play className="h-4 w-4 mr-2" />
            Resume Campaign
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => toast.error('Campaign deleted', { description: `"${campaign.name}" has been removed.` })}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<Campaign, unknown>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.name} ${row.targetAudience}`,
    header: 'Campaign',
    size: 280,
    cell: ({ row }) => {
      const c = row.original
      const cfg = CAMPAIGN_TYPE_CONFIG[c.type]
      return (
        <div className="flex items-start gap-2.5">
          <span className="text-base mt-0.5 shrink-0">{cfg.icon}</span>
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
    cell: ({ row }) => <CampaignRowActions campaign={row.original} />,
  },
]

// ─── Main export ──────────────────────────────────────────────────────────────

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const [newOpen, setNewOpen] = useState(false)

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
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Campaign
            </Button>
          </>
        )}
        emptyMessage="No campaigns found"
        emptyDescription="Create your first campaign to start reaching your audience."
      />
      <NewCampaignDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  )
}
