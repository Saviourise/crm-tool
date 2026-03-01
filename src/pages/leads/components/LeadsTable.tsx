import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Mail, Phone, Trash2, Pencil, CheckSquare, Clock, ArrowRightLeft, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus, LeadSource } from '../typings'
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '../data'
import { ROUTES } from '@/router/routes'

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  contacted: 'bg-[oklch(var(--metric-orange))] text-[oklch(var(--warning))] border-[oklch(var(--warning))]/20',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  unqualified: 'bg-muted text-muted-foreground border-border',
  converted: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
}

const sourceLabels: Record<LeadSource, string> = {
  website: 'Website',
  referral: 'Referral',
  social: 'Social',
  email: 'Email',
  phone: 'Phone',
  event: 'Event',
  other: 'Other',
}

function ScoreIndicator({ score }: { score: number }) {
  const color = score >= 70
    ? 'bg-[oklch(var(--success))]'
    : score >= 40
      ? 'bg-[oklch(var(--warning))]'
      : 'bg-destructive'
  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-2 w-2 rounded-full shrink-0', color)} />
      <span className="text-sm font-medium tabular-nums">{score}</span>
    </div>
  )
}

function EditLeadDialog({ lead, open, onOpenChange }: {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Lead updated', { description: `${lead.firstName} ${lead.lastName} has been updated.` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>Update the details for {lead.firstName} {lead.lastName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-first">First Name</Label>
                <Input id="edit-first" defaultValue={lead.firstName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last">Last Name</Label>
                <Input id="edit-last" defaultValue={lead.lastName} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" defaultValue={lead.email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input id="edit-company" defaultValue={lead.company ?? ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input id="edit-position" defaultValue={lead.position ?? ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={lead.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-source">Source</Label>
                <Select defaultValue={lead.source}>
                  <SelectTrigger id="edit-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-score">Score (0–100)</Label>
                <Input id="edit-score" type="number" min={0} max={100} defaultValue={lead.score} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-value">Est. Value ($)</Label>
                <Input id="edit-value" type="number" min={0} defaultValue={lead.value ?? ''} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assigned">Assigned To</Label>
              <Input id="edit-assigned" defaultValue={lead.assignedTo ?? ''} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConvertLeadDialog({ lead, open, onOpenChange }: {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleConvert = () => {
    toast.success('Lead converted', {
      description: `${lead.firstName} ${lead.lastName} has been added to Contacts.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Convert to Contact</DialogTitle>
          <DialogDescription>
            This will create a contact record for <strong>{lead.firstName} {lead.lastName}</strong> and mark this lead as converted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConvert}>
            <UserCheck className="h-4 w-4 mr-2" />
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteLeadDialog({ lead, open, onOpenChange }: {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleDelete = () => {
    toast.error('Lead deleted', { description: `${lead.firstName} ${lead.lastName} has been removed.` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{lead.firstName} {lead.lastName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LeadRowActions({ lead }: { lead: Lead }) {
  const [editOpen, setEditOpen] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <a href={`mailto:${lead.email}`} title="Send email">
            <Mail className="h-3.5 w-3.5" />
          </a>
        </Button>
        {lead.phone && (
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={`tel:${lead.phone}`} title="Call">
              <Phone className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConvertOpen(true)}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Convert to Contact
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTaskOpen(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Create Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Activity logged', { description: `Activity logged for ${lead.firstName} ${lead.lastName}.` })}>
              <Clock className="h-4 w-4 mr-2" />
              Log Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditLeadDialog lead={lead} open={editOpen} onOpenChange={setEditOpen} />
      <ConvertLeadDialog lead={lead} open={convertOpen} onOpenChange={setConvertOpen} />
      <DeleteLeadDialog lead={lead} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </>
  )
}

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const columns: ColumnDef<Lead, unknown>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email} ${row.company ?? ''}`,
    header: 'Lead',
    size: 240,
    cell: ({ row }) => {
      const lead = row.original
      const initials = `${lead.firstName[0]}${lead.lastName[0]}`
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              to={ROUTES.LEAD_DETAIL(lead.id)}
              className="font-medium text-sm hover:text-primary hover:underline"
            >
              {lead.firstName} {lead.lastName}
            </Link>
            <a
              href={`mailto:${lead.email}`}
              className="text-xs text-muted-foreground hover:text-primary truncate max-w-[150px] block"
            >
              {lead.email}
            </a>
          </div>
        </div>
      )
    },
  },
  {
    id: 'company',
    accessorFn: (row) => `${row.company ?? ''} ${row.position ?? ''}`.trim(),
    header: 'Company',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.company ?? '—'}</p>
        {row.original.position && (
          <p className="text-xs text-muted-foreground mt-0.5">{row.original.position}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn('capitalize text-xs font-medium', statusStyles[row.original.status])}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    filterFn: 'equals',
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {sourceLabels[row.original.source]}
      </Badge>
    ),
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => <ScoreIndicator score={row.original.score} />,
  },
  {
    accessorKey: 'value',
    header: 'Est. Value',
    cell: ({ row }) => (
      <p className="text-sm font-medium tabular-nums">
        {row.original.value ? currencyFormat.format(row.original.value) : '—'}
      </p>
    ),
  },
  {
    id: 'assignedTo',
    accessorFn: (row) => row.assignedTo ?? '',
    header: 'Assigned To',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">{row.original.assignedTo ?? 'Unassigned'}</p>
    ),
  },
  {
    id: 'lastActivity',
    accessorFn: (row) => row.lastActivity ?? '',
    header: 'Last Activity',
    enableSorting: false,
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">{row.original.lastActivity ?? '—'}</p>
    ),
  },
  {
    id: 'actions',
    header: '',
    size: 100,
    enableSorting: false,
    cell: ({ row }) => <LeadRowActions lead={row.original} />,
  },
]

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <DataTable
      columns={columns}
      data={leads}
      searchPlaceholder="Search by name, email, company..."
      toolbar={(table) => (
        <>
          <Select
            value={(table.getColumn('status')?.getFilterValue() as LeadStatus | undefined) ?? 'all'}
            onValueChange={(val) => {
              table.getColumn('status')?.setFilterValue(val === 'all' ? undefined : val)
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('source')?.getFilterValue() as LeadSource | undefined) ?? 'all'}
            onValueChange={(val) => {
              table.getColumn('source')?.setFilterValue(val === 'all' ? undefined : val)
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[145px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      emptyMessage="No leads found"
      emptyDescription="Try adjusting your search or filters"
    />
  )
}
