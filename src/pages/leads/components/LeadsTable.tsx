import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Mail, Phone, Trash2, Pencil, CheckSquare, Clock, ArrowRightLeft, UserCheck, Loader2, X } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { LogActivityDialog } from '@/components/common/LogActivityDialog'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus, LeadSource } from '../typings'
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '../data'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/auth/context'
import { leadsApi } from '@/api/leads'
import { SOURCE_UI_TO_API } from '../apiMappers'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'
import { LEADS_QUERY_KEY } from '../index'

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  contacted: 'bg-[oklch(var(--metric-orange))] text-[oklch(var(--warning))] border-[oklch(var(--warning))]/20',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  unqualified: 'bg-muted text-muted-foreground border-border',
  converted: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
  lost: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
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
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<string>(lead.status)
  const [source, setSource] = useState<string>(lead.source)

  const updateLead = useMutation({
    mutationFn: (data: Parameters<typeof leadsApi.update>[1]) =>
      leadsApi.update(lead.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['leads', lead.id] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      toast.success('Lead updated', { description: `${lead.firstName} ${lead.lastName} has been updated.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to update lead', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    updateLead.mutate({
      first_name: (form.elements.namedItem('edit-first') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('edit-last') as HTMLInputElement).value,
      email: (form.elements.namedItem('edit-email') as HTMLInputElement).value,
      company: (form.elements.namedItem('edit-company') as HTMLInputElement).value || undefined,
      position: (form.elements.namedItem('edit-position') as HTMLInputElement).value || undefined,
      status,
      source: SOURCE_UI_TO_API[source as LeadSource] ?? source,
      score: parseInt((form.elements.namedItem('edit-score') as HTMLInputElement).value) || undefined,
      value: (form.elements.namedItem('edit-value') as HTMLInputElement).value || undefined,
    })
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
                <Input id="edit-first" name="edit-first" defaultValue={lead.firstName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last">Last Name</Label>
                <Input id="edit-last" name="edit-last" defaultValue={lead.lastName} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" name="edit-email" type="email" defaultValue={lead.email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input id="edit-company" name="edit-company" defaultValue={lead.company ?? ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input id="edit-position" name="edit-position" defaultValue={lead.position ?? ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
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
                <Select value={source} onValueChange={setSource}>
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
                <Input id="edit-score" name="edit-score" type="number" min={0} max={100} defaultValue={lead.score} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-value">Est. Value ($)</Label>
                <Input id="edit-value" name="edit-value" type="number" min={0} defaultValue={lead.value ?? ''} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateLead.isPending}>
              {updateLead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
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
  const queryClient = useQueryClient()

  const convertLead = useMutation({
    mutationFn: () => leadsApi.convert(lead.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      toast.success('Lead converted', {
        description: `${lead.firstName} ${lead.lastName} has been added to Contacts.${res.data.deal_id ? ' Deal created.' : ''}`,
      })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to convert lead', { description: 'Please try again.' })
    },
  })

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
          <Button onClick={() => convertLead.mutate()} disabled={convertLead.isPending}>
            {convertLead.isPending
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <UserCheck className="h-4 w-4 mr-2" />
            }
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
  const queryClient = useQueryClient()

  const deleteLead = useMutation({
    mutationFn: () => leadsApi.delete(lead.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      toast.error('Lead deleted', { description: `${lead.firstName} ${lead.lastName} has been removed.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to delete lead', { description: 'Please try again.' })
    },
  })

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
          <Button variant="destructive" onClick={() => deleteLead.mutate()} disabled={deleteLead.isPending}>
            {deleteLead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Lead
          </Button>
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
  const [logOpen, setLogOpen] = useState(false)
  const { can } = useAuth()

  const canEdit = can('leads.edit')
  const canConvert = can('leads.convert')
  const canDelete = can('leads.delete')
  const hasWriteAccess = canEdit || canConvert || canDelete

  return (
    <>
      <div className="flex items-center gap-1">
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
        {hasWriteAccess && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Lead
                </DropdownMenuItem>
              )}
              {canConvert && lead.status !== 'converted' && (
                <DropdownMenuItem onClick={() => setConvertOpen(true)}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Convert to Contact
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setTaskOpen(true)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Create Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Log Activity
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <EditLeadDialog lead={lead} open={editOpen} onOpenChange={setEditOpen} />
      <ConvertLeadDialog lead={lead} open={convertOpen} onOpenChange={setConvertOpen} />
      <DeleteLeadDialog lead={lead} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <LogActivityDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        entityName={`${lead.firstName} ${lead.lastName}`}
        leadId={lead.id}
      />
    </>
  )
}

function BulkActionsBar({
  count,
  onDeleteClick,
  onClear,
  isDeleting,
}: {
  count: number
  onDeleteClick: () => void
  onClear: () => void
  isDeleting: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground animate-in slide-in-from-top-2 duration-200">
      <span className="text-sm font-medium tabular-nums shrink-0">
        {count} lead{count !== 1 ? 's' : ''} selected
      </span>
      <div className="h-4 w-px bg-primary-foreground/25" />
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/15 gap-1.5"
        onClick={onDeleteClick}
        disabled={isDeleting}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? 'Deleting…' : 'Delete'}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/15 shrink-0 ml-auto"
        onClick={onClear}
        disabled={isDeleting}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function BulkDeleteConfirmDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
  isDeleting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  onConfirm: () => void
  isDeleting: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete {count} lead{count !== 1 ? 's' : ''}?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} lead{count !== 1 ? 's' : ''}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function buildColumns(
  selectedIds: Set<string>,
  onSelectAll: (checked: boolean) => void,
  onSelectRow: (id: string, checked: boolean) => void,
): ColumnDef<Lead, unknown>[] {
  return [
  {
    id: 'select',
    size: 40,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getRowModel().rows.length > 0 &&
          table.getRowModel().rows.every((r) => selectedIds.has(r.original.id))
        }
        onCheckedChange={(v) => onSelectAll(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedIds.has(row.original.id)}
        onCheckedChange={(v) => onSelectRow(row.original.id, !!v)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
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
}

interface LeadsTableProps {
  leads: Lead[]
  isLoading?: boolean
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  source: string
  onSourceChange: (value: string) => void
  serverSide: {
    pageSize: number
    onPageSizeChange: (size: number) => void
    hasNext: boolean
    hasPrev: boolean
    onNext: () => void
    onPrev: () => void
    totalLabel: string
  }
}

export function LeadsTable({
  leads,
  isLoading,
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  serverSide,
}: LeadsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const { can } = useAuth()
  const canDelete = can('leads.delete')

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => leadsApi.bulkDelete(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Leads deleted', { description: `${ids.length} lead${ids.length !== 1 ? 's' : ''} removed.` })
      setSelectedIds(new Set())
    },
    onError: () => {
      toast.error('Failed to delete leads', { description: 'Please try again.' })
    },
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(leads.map((l) => l.id)) : new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const columns = buildColumns(selectedIds, handleSelectAll, handleSelectRow)

  return (
    <div className="space-y-2">
      {selectedIds.size > 0 && canDelete && (
        <>
          <BulkActionsBar
            count={selectedIds.size}
            onDeleteClick={() => setDeleteConfirmOpen(true)}
            onClear={() => setSelectedIds(new Set())}
            isDeleting={bulkDelete.isPending}
          />
          <BulkDeleteConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            count={selectedIds.size}
            onConfirm={() => {
              bulkDelete.mutate(Array.from(selectedIds))
              setDeleteConfirmOpen(false)
            }}
            isDeleting={bulkDelete.isPending}
          />
        </>
      )}
      <DataTable
      columns={columns}
      data={leads}
      isLoading={isLoading}
      searchPlaceholder="Search by name, email, company..."
      toolbar={() => (
        <>
          <Select
            value={status}
            onValueChange={onStatusChange}
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
            value={source}
            onValueChange={onSourceChange}
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
      serverSide={{
        ...serverSide,
        searchValue: search,
        onSearchChange,
      }}
    />
    </div>
  )
}
