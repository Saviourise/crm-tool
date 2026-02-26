import { Search, Plus, Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import type { ContactFilters, ContactStatus } from '../typings'
import { STATUS_OPTIONS } from '../data'

interface ContactsHeaderProps {
  filters: ContactFilters
  total: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: ContactStatus | 'all') => void
}

export function ContactsHeader({ filters, total, onSearchChange, onStatusChange }: ContactsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            {total} contact{total !== 1 ? 's' : ''} in your CRM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Import contacts', { description: 'CSV import coming soon.' })}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Contacts exported', { description: 'Your contacts have been exported as CSV.' })}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <AddContactDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(val) => onStatusChange(val as ContactStatus | 'all')}
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
      </div>
    </div>
  )
}
