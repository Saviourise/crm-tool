import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Mail, Phone, Linkedin, Trash2, Pencil, CheckSquare, Clock } from 'lucide-react'
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
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { Contact } from '../typings'
import { STATUS_OPTIONS } from '../data'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/auth/context'
import { contactsApi } from '@/api/contacts'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'

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
  const updateContact = useMutation({
    mutationFn: (data: { first_name: string; last_name: string; email: string; company?: string; position?: string; phone?: string }) =>
      contactsApi.update(contact.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Contact updated', { description: `${contact.firstName} ${contact.lastName} has been updated.` })
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
      company: (form.elements.namedItem('edit-company') as HTMLInputElement).value || undefined,
      position: (form.elements.namedItem('edit-position') as HTMLInputElement).value || undefined,
      phone: (form.elements.namedItem('edit-phone') as HTMLInputElement).value || undefined,
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
              <Input id="edit-company" name="edit-company" defaultValue={contact.company ?? ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input id="edit-position" name="edit-position" defaultValue={contact.position ?? ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" name="edit-phone" defaultValue={contact.phone ?? ''} />
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
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <a href={`mailto:${contact.email}`} title="Send email">
            <Mail className="h-3.5 w-3.5" />
          </a>
        </Button>
        {contact.phone && (
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={`tel:${contact.phone}`} title="Call">
              <Phone className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
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
      <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <LogActivityDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        entityName={`${contact.firstName} ${contact.lastName}`}
        contactId={contact.id}
      />
    </>
  )
}

const columns: ColumnDef<Contact, unknown>[] = [
  {
    id: 'name',
    // Include email in accessor so global search matches it
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
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-muted-foreground hover:text-primary truncate max-w-[160px] block"
            >
              {contact.email}
            </a>
          </div>
        </div>
      )
    },
  },
  {
    id: 'company',
    // Include position in accessor so global search matches it
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

interface ContactsTableProps {
  contacts: Contact[]
  isLoading?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  status?: string
  onStatusChange?: (value: string) => void
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
  serverSide,
}: ContactsTableProps) {
  return (
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
      )}
      emptyMessage="No contacts found"
      emptyDescription="Try adjusting your search or filters"
    />
  )
}
