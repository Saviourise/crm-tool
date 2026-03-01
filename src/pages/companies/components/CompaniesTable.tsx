import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
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
import { ROUTES } from '@/router/routes'
import type { Company, CompanyStatus } from '../typings'
import { INDUSTRY_OPTIONS, STATUS_OPTIONS } from '../data'
import { getStatusClass, formatRevenue } from '../utils'
import { useAuth } from '@/auth/context'

function EditCompanyDialog({ company, open, onOpenChange }: {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Company updated', { description: `${company.name} has been updated.` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update the details for {company.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-company-name">Company Name</Label>
              <Input id="edit-company-name" defaultValue={company.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company-website">Website</Label>
              <Input id="edit-company-website" defaultValue={company.website} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company-industry">Industry</Label>
                <Select defaultValue={company.industry}>
                  <SelectTrigger id="edit-company-industry"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-company-status">Status</Label>
                <Select defaultValue={company.status}>
                  <SelectTrigger id="edit-company-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company-employees">Employees</Label>
                <Input id="edit-company-employees" type="number" defaultValue={company.employees} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-company-revenue">Annual Revenue ($)</Label>
                <Input id="edit-company-revenue" type="number" defaultValue={company.annualRevenue} />
              </div>
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

function DeleteCompanyDialog({ company, open, onOpenChange }: {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleDelete = () => {
    toast.error('Company deleted', { description: `${company.name} has been removed.` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CompanyRowActions({ company }: { company: Company }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { can } = useAuth()

  const canEdit = can('companies.edit')
  const canDelete = can('companies.delete')

  return (
    <>
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
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to={ROUTES.COMPANY_DETAIL(company.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          {canDelete && (
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

      <EditCompanyDialog company={company} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteCompanyDialog company={company} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}

const columns: ColumnDef<Company, unknown>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.name} ${row.website}`,
    header: 'Company',
    size: 220,
    cell: ({ row }) => {
      const company = row.original
      return (
        <div>
          <Link
            to={ROUTES.COMPANY_DETAIL(company.id)}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {company.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{company.website}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'industry',
    header: 'Industry',
    filterFn: 'equals',
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.original.industry}
      </Badge>
    ),
  },
  {
    accessorKey: 'employees',
    header: 'Employees',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.employees.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'contactCount',
    header: 'Contacts',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.contactCount}</span>
    ),
  },
  {
    accessorKey: 'openDeals',
    header: 'Open Deals',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.openDeals}</span>
    ),
  },
  {
    accessorKey: 'annualRevenue',
    header: 'Revenue',
    cell: ({ row }) => (
      <span className="text-sm font-medium">{formatRevenue(row.original.annualRevenue)}</span>
    ),
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.owner}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn('capitalize text-xs font-medium', getStatusClass(row.original.status))}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    size: 60,
    enableSorting: false,
    cell: ({ row }) => <CompanyRowActions company={row.original} />,
  },
]

export function CompaniesTable({ companies }: { companies: Company[] }) {
  return (
    <DataTable
      columns={columns}
      data={companies}
      searchPlaceholder="Search companies..."
      toolbar={(table) => (
        <div className="flex items-center gap-2">
          <Select
            value={(table.getColumn('industry')?.getFilterValue() as string | undefined) ?? 'all'}
            onValueChange={(val) => {
              table.getColumn('industry')?.setFilterValue(val === 'all' ? undefined : val)
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('status')?.getFilterValue() as CompanyStatus | undefined) ?? 'all'}
            onValueChange={(val) => {
              table.getColumn('status')?.setFilterValue(val === 'all' ? undefined : val)
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Statuses" />
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
      )}
      emptyMessage="No companies found"
      emptyDescription="Try adjusting your search or filters"
    />
  )
}
