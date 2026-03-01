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

function CompanyRowActions({ company }: { company: Company }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info('Edit Company', { description: `Editing ${company.name}.` })}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={ROUTES.COMPANY_DETAIL(company.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => toast.error('Company deleted', { description: `${company.name} has been removed.` })}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
