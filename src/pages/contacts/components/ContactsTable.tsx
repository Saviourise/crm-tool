import { useState } from 'react'
import { MoreHorizontal, Mail, Phone, Linkedin, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Pencil, CheckSquare, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { cn } from '@/lib/utils'
import type { Contact, SortField, ContactFilters } from '../typings'

const statusStyles: Record<Contact['status'], string> = {
  active: 'bg-[oklch(var(--metric-green))] text-[oklch(var(--success))] border-[oklch(var(--success))]/20',
  prospect: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  inactive: 'bg-muted text-muted-foreground border-border',
}

interface ContactsTableProps {
  contacts: Contact[]
  filters: ContactFilters
  onSort: (field: SortField) => void
}

function SortButton({ field, label, currentSort, onSort }: {
  field: SortField
  label: string
  currentSort: ContactFilters
  onSort: (field: SortField) => void
}) {
  const isActive = currentSort.sortField === field
  const Icon = isActive
    ? currentSort.sortDirection === 'asc' ? ArrowUp : ArrowDown
    : ArrowUpDown

  return (
    <button
      className={cn(
        'flex items-center gap-1 transition-colors',
        isActive ? 'text-foreground font-semibold' : 'hover:text-foreground'
      )}
      onClick={() => onSort(field)}
    >
      {label}
      <Icon className={cn('h-3 w-3', isActive ? 'text-primary' : 'text-muted-foreground')} />
    </button>
  )
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
      <NewTaskDialog trigger={null} open={taskOpen} onOpenChange={setTaskOpen} />
    </>
  )
}

export function ContactsTable({ contacts, filters, onSort }: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No contacts found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[260px]">
              <SortButton field="name" label="Name" currentSort={filters} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortButton field="company" label="Company" currentSort={filters} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortButton field="status" label="Status" currentSort={filters} onSort={onSort} />
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>
              <SortButton field="lastContacted" label="Last Contacted" currentSort={filters} onSort={onSort} />
            </TableHead>
            <TableHead className="w-[130px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const initials = `${contact.firstName[0]}${contact.lastName[0]}`
            return (
              <TableRow key={contact.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{contact.firstName} {contact.lastName}</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-xs text-muted-foreground hover:text-primary truncate max-w-[160px] block"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-sm font-medium">{contact.company ?? '—'}</p>
                  {contact.position && (
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.position}</p>
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('capitalize text-xs font-medium', statusStyles[contact.status])}
                  >
                    {contact.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        +{contact.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-muted-foreground">{contact.lastContacted ?? 'Never'}</p>
                </TableCell>

                <TableCell>
                  <ContactRowActions contact={contact} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
