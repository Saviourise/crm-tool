import { MoreHorizontal, Mail, Phone, Linkedin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const initials = `${contact.firstName[0]}${contact.lastName[0]}`
            return (
              <TableRow key={contact.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-xs text-muted-foreground hover:text-primary truncate max-w-[160px]"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{contact.company ?? '—'}</p>
                    {contact.position && (
                      <p className="text-xs text-muted-foreground mt-0.5">{contact.position}</p>
                    )}
                  </div>
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={`mailto:${contact.email}`}>
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {contact.phone && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={`tel:${contact.phone}`}>
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    {contact.linkedin && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Linkedin className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                        <DropdownMenuItem>Create Task</DropdownMenuItem>
                        <DropdownMenuItem>Log Activity</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
