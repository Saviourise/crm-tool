import { useState } from 'react'
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
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import type { Contact, ContactStatus } from '../typings'
import { STATUS_OPTIONS } from '../data'
import { ROUTES } from '@/router/routes'

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Contact updated', { description: `${contact.firstName} ${contact.lastName} has been updated.` })
    onOpenChange(false)
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
                <Input id="edit-first" defaultValue={contact.firstName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last">Last Name</Label>
                <Input id="edit-last" defaultValue={contact.lastName} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" defaultValue={contact.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input id="edit-company" defaultValue={contact.company ?? ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input id="edit-position" defaultValue={contact.position ?? ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" defaultValue={contact.phone ?? ''} />
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

function DeleteConfirmDialog({ contact, open, onOpenChange }: {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleDelete = () => {
    toast.error('Contact deleted', { description: `${contact.firstName} ${contact.lastName} has been removed.` })
    onOpenChange(false)
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
          <Button variant="destructive" onClick={handleDelete}>Delete Contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ContactRowActions({ contact }: { contact: Contact }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Contact
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTaskOpen(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Create Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Activity logged', { description: `Activity logged for ${contact.firstName} ${contact.lastName}.` })}>
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

      <EditContactDialog contact={contact} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteConfirmDialog contact={contact} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
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

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  return (
    <DataTable
      columns={columns}
      data={contacts}
      searchPlaceholder="Search by name, email, company..."
      toolbar={(table) => (
        <Select
          value={(table.getColumn('status')?.getFilterValue() as ContactStatus | undefined) ?? 'all'}
          onValueChange={(val) => {
            table.getColumn('status')?.setFilterValue(val === 'all' ? undefined : val)
            table.setPageIndex(0)
          }}
        >
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
