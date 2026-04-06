import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Linkedin, Trash2, Pencil, CheckSquare, Clock, Loader2 } from 'lucide-react'
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
import { LogActivityDialog } from '@/components/common/LogActivityDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/common/DataTable'
import { BulkSelectionBar } from '@/components/common/BulkSelectionBar'
import { BulkDeleteConfirmDialog } from '@/components/common/BulkDeleteConfirmDialog'
import { cn } from '@/lib/utils'
import type { Contact } from '../typings'
import { STATUS_OPTIONS } from '../data'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/auth/context'
import { contactsApi } from '@/api/contacts'
import { companiesApi } from '@/api/companies'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'
import { patchContactsListCaches } from '@/lib/listQueryCache'
import { useWorkspaceUsers } from '@/hooks/useWorkspaceUsers'

const CONTACTS_QUERY_KEY = ['contacts']

const statusStyles: Record<Contact['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  prospect: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  inactive: 'bg-muted text-muted-foreground border-border',
}

function EditContactDialog({ contact, open, onOpenChange }: {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [companyId, setCompanyId] = useState<string>(contact.companyId ?? '')
  const [status, setStatus] = useState<string>(contact.status)
  const [assignedToId, setAssignedToId] = useState<string>(contact.assignedToId ?? '')

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list({ limit: 200 }),
    enabled: open,
  })
  const { users, isLoading: usersLoading } = useWorkspaceUsers()

  const companies = companiesData?.data?.results ?? []

  useEffect(() => {
    if (open) {
      setCompanyId(contact.companyId ?? '')
      setStatus(contact.status)
      setAssignedToId(contact.assignedToId ?? '')
    }
  }, [open, contact.companyId, contact.status])

  const updateContact = useMutation({
    mutationFn: (data: { first_name: string; last_name: string; email: string; company?: string; position?: string; phone?: string; status?: string }) =>
      contactsApi.update(contact.id, data),
    onSuccess: (res) => {
      const api = res.data
      patchContactsListCaches(queryClient, contact.id, api)
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Contact updated', { description: `${api.first_name} ${api.last_name} has been updated.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to update contact', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      first_name: (form.elements.namedItem('edit-first') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('edit-last') as HTMLInputElement).value,
      email: (form.elements.namedItem('edit-email') as HTMLInputElement).value,
      ...(companyId && { company: companyId }),
      position: (form.elements.namedItem('edit-position') as HTMLInputElement).value || undefined,
      phone: (form.elements.namedItem('edit-phone') as HTMLInputElement).value || undefined,
      status,
      assigned_to: assignedToId || null,
    }
    updateContact.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update the details for {contact.firstName} {contact.lastName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-first">First Name</Label>
                <Input id="edit-first" name="edit-first" defaultValue={contact.firstName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last">Last Name</Label>
                <Input id="edit-last" name="edit-last" defaultValue={contact.lastName} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" name="edit-email" type="email" defaultValue={contact.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company">Company</Label>
              <Select value={companyId || 'none'} onValueChange={(v) => setCompanyId(v === 'none' ? '' : v)} disabled={companiesLoading}>
                <SelectTrigger id="edit-company" className="w-full">
                  {companiesLoading ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading companies…
                    </span>
                  ) : (
                    <SelectValue placeholder="Select a company" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input id="edit-position" name="edit-position" defaultValue={contact.position ?? ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" name="edit-phone" defaultValue={contact.phone ?? ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assignee">Assignee</Label>
              <Select value={assignedToId || 'none'} onValueChange={(v) => setAssignedToId(v === 'none' ? '' : v)} disabled={usersLoading}>
                <SelectTrigger id="edit-assignee" className="w-full">
                  {usersLoading ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />Loading...
                    </span>
                  ) : (
                    <SelectValue placeholder="Unassigned" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateContact.isPending}>
              {updateContact.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({ contact, open, onOpenChange }: {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const deleteContact = useMutation({
    mutationFn: () => contactsApi.delete(contact.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.contactsCount })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Contact deleted', { description: `${contact.firstName} ${contact.lastName} has been removed.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to delete contact', { description: 'Please try again.' })
    },
  })

  const handleDelete = () => {
    deleteContact.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{contact.firstName} {contact.lastName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteContact.isPending}>
            {deleteContact.isPending ? 'Deleting…' : 'Delete Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ContactRowActions({ contact }: { contact: Contact }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const { can } = useAuth()

  const canEdit = can('contacts.edit')
  const canDelete = can('contacts.delete')
  const hasWriteAccess = canEdit || canDelete

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Communication is disabled for initial release */}
        {/* <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link
            to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=email`}
            title="Send email"
          >
            <Mail className="h-3.5 w-3.5" />
          </Link>
        </Button> */}
        {/* {contact.phone && (
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link
              to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=call`}
              title="Call"
            >
              <Phone className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )} */}
        {contact.linkedin && (
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <Linkedin className="h-3.5 w-3.5" />
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
                  Edit Contact
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

      <EditContactDialog contact={contact} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteConfirmDialog contact={contact} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <NewTaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        relatedType="contact"
        relatedId={contact.id}
        relatedName={`${contact.firstName} ${contact.lastName}`}
      />
      <LogActivityDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        entityName={`${contact.firstName} ${contact.lastName}`}
        contactId={contact.id}
      />
    </>
  )
}

function buildColumns(
  selectedIds: Set<string>,
  onSelectAll: (checked: boolean) => void,
  onSelectRow: (id: string, checked: boolean) => void,
): ColumnDef<Contact, unknown>[] {
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
      accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
      header: 'Name',
      size: 260,
      cell: ({ row }) => {
      const contact = row.original
      const initials = `${contact.firstName[0]}${contact.lastName[0]}`
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              to={ROUTES.CONTACT_DETAIL(contact.id)}
              className="font-medium text-sm hover:text-primary hover:underline"
            >
              {contact.firstName} {contact.lastName}
            </Link>
            {/* Communication is disabled for initial release */}
            {/* <Link
              to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=email`}
              className="text-xs text-muted-foreground hover:text-primary truncate max-w-[160px] block"
            >
              {contact.email}
            </Link> */}
            <span className="text-xs text-muted-foreground truncate max-w-[160px] block">
              {contact.email}
            </span>
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
      id: 'tags',
      accessorFn: (row) => row.tags.join(' '),
      header: 'Tags',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {row.original.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{row.original.tags.length - 2}
            </Badge>
          )}
        </div>
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
      id: 'lastContacted',
      accessorFn: (row) => row.lastContacted ?? '',
      header: 'Last Contacted',
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">{row.original.lastContacted ?? 'Never'}</p>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 130,
      enableSorting: false,
      cell: ({ row }) => <ContactRowActions contact={row.original} />,
    },
  ]
}

interface ContactsTableProps {
  contacts: Contact[]
  isLoading?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  status?: string
  onStatusChange?: (value: string) => void
  assignedTo?: string
  onAssignedToChange?: (value: string) => void
  serverSide?: {
    pageSize: number
    onPageSizeChange: (size: number) => void
    hasNext: boolean
    hasPrev: boolean
    onNext: () => void
    onPrev: () => void
    totalLabel?: string
  }
}

export function ContactsTable({
  contacts,
  isLoading,
  search = '',
  onSearchChange,
  status = 'all',
  onStatusChange,
  assignedTo = 'all',
  onAssignedToChange,
  serverSide,
}: ContactsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const { can } = useAuth()
  const canDelete = can('contacts.delete')
  const { users: workspaceUsers } = useWorkspaceUsers()

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => contactsApi.bulkDelete(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.contactsCount })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Contacts deleted', { description: `${ids.length} contact${ids.length !== 1 ? 's' : ''} removed.` })
      setSelectedIds(new Set())
    },
    onError: () => {
      toast.error('Failed to delete contacts', { description: 'Please try again.' })
    },
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(contacts.map((c) => c.id)) : new Set())
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleBulkDeleteConfirm = () => {
    const ids = Array.from(selectedIds)
    if (ids.length > 0) {
      bulkDelete.mutate(ids)
      setDeleteConfirmOpen(false)
    }
  }

  const columns = buildColumns(selectedIds, handleSelectAll, handleSelectRow)

  return (
    <div className="space-y-2">
      {selectedIds.size > 0 && canDelete && (
        <>
          <BulkSelectionBar
            count={selectedIds.size}
            label={`contact${selectedIds.size !== 1 ? 's' : ''}`}
            onClear={clearSelection}
          >
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/15 gap-1.5"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={bulkDelete.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {bulkDelete.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </BulkSelectionBar>
          <BulkDeleteConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            count={selectedIds.size}
            entityLabel={selectedIds.size === 1 ? 'contact' : 'contacts'}
            onConfirm={handleBulkDeleteConfirm}
            isDeleting={bulkDelete.isPending}
          />
        </>
      )}
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={contacts}
      searchPlaceholder="Search by name, email, company..."
      serverSide={
        serverSide
          ? {
              ...serverSide,
              searchValue: search,
              onSearchChange: onSearchChange ?? undefined,
            }
          : undefined
      }
      toolbar={() => (
        <>
          <Select value={status} onValueChange={onStatusChange ?? (() => {})}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assignedTo} onValueChange={onAssignedToChange ?? (() => {})}>
            <SelectTrigger className="w-[155px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {workspaceUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      emptyMessage="No contacts found"
      emptyDescription="Try adjusting your search or filters"
      />
    </div>
  )
}
