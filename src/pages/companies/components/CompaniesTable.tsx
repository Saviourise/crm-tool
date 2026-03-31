import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/common/DataTable'
import { BulkSelectionBar } from '@/components/common/BulkSelectionBar'
import { BulkDeleteConfirmDialog } from '@/components/common/BulkDeleteConfirmDialog'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/router/routes'
import type { Company } from '../typings'
import { INDUSTRY_OPTIONS, STATUS_OPTIONS } from '../data'
import { getStatusClass, getIndustryLabel, formatRevenue } from '../utils'
import { useAuth } from '@/auth/context'
import { companiesApi } from '@/api/companies'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'
import { patchCompaniesListCaches } from '@/lib/listQueryCache'

const COMPANIES_QUERY_KEY = ['companies']

function EditCompanyDialog({ company, open, onOpenChange }: {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [industry, setIndustry] = useState<string>(company.industry)
  const [status, setStatus] = useState<string>(company.status)
  const queryClient = useQueryClient()
  const updateCompany = useMutation({
    mutationFn: (data: { name?: string; industry?: string; website?: string; status?: string; employees?: number; annual_revenue?: number; phone?: string; address?: string }) =>
      companiesApi.update(company.id, data),
    onSuccess: (res) => {
      const api = res.data
      patchCompaniesListCaches(queryClient, company.id, api)
      queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Company updated', { description: `${api.name} has been updated.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to update company', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const employeesRaw = (form.elements.namedItem('edit-company-employees') as HTMLInputElement).value.trim()
    const employees = employeesRaw ? parseInt(employeesRaw, 10) : undefined
    const annualRevenueRaw = (form.elements.namedItem('edit-company-annual-revenue') as HTMLInputElement).value.trim()
    const annualRevenue = annualRevenueRaw ? parseFloat(annualRevenueRaw.replace(/,/g, '')) : undefined
    const data = {
      name: (form.elements.namedItem('edit-company-name') as HTMLInputElement).value.trim(),
      website: (form.elements.namedItem('edit-company-website') as HTMLInputElement).value.trim() || undefined,
      industry: industry || undefined,
      status: status || undefined,
      ...(employees !== undefined && !isNaN(employees) && { employees }),
      ...(annualRevenue !== undefined && !isNaN(annualRevenue) && { annual_revenue: annualRevenue }),
      phone: (form.elements.namedItem('edit-company-phone') as HTMLInputElement).value.trim() || undefined,
      address: (form.elements.namedItem('edit-company-address') as HTMLInputElement).value.trim() || undefined,
    }
    updateCompany.mutate(data)
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
              <Input id="edit-company-name" name="edit-company-name" defaultValue={company.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company-website">Website</Label>
              <Input id="edit-company-website" name="edit-company-website" defaultValue={company.website} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company-employees">Number of Employees</Label>
              <Input id="edit-company-employees" name="edit-company-employees" type="number" min={0} defaultValue={company.employees || ''} placeholder="e.g. 50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company-annual-revenue">Annual Revenue</Label>
              <Input id="edit-company-annual-revenue" name="edit-company-annual-revenue" defaultValue={company.annualRevenue ? String(company.annualRevenue) : ''} placeholder="e.g. 1500000.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company-phone">Phone</Label>
              <Input id="edit-company-phone" name="edit-company-phone" type="tel" defaultValue={company.phone ?? ''} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company-address">Address</Label>
              <Input id="edit-company-address" name="edit-company-address" defaultValue={company.address ?? ''} placeholder="123 Main St, City, Country" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company-industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
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
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="edit-company-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
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
  const queryClient = useQueryClient()
  const deleteCompany = useMutation({
    mutationFn: () => companiesApi.delete(company.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Company deleted', { description: `${company.name} has been removed.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to delete company', { description: 'Please try again.' })
    },
  })

  const handleDelete = () => {
    deleteCompany.mutate()
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
          <Button variant="destructive" onClick={handleDelete} disabled={deleteCompany.isPending}>
            {deleteCompany.isPending ? 'Deleting…' : 'Delete Company'}
          </Button>
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

function buildColumns(
  selectedIds: Set<string>,
  onSelectAll: (checked: boolean) => void,
  onSelectRow: (id: string, checked: boolean) => void,
): ColumnDef<Company, unknown>[] {
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
          {getIndustryLabel(row.original.industry)}
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
}

interface CompaniesTableProps {
  companies: Company[]
  isLoading?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  status?: string
  onStatusChange?: (value: string) => void
  industry?: string
  onIndustryChange?: (value: string) => void
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

export function CompaniesTable({
  companies,
  isLoading,
  search = '',
  onSearchChange,
  status = 'all',
  onStatusChange,
  industry = 'all',
  onIndustryChange,
  serverSide,
}: CompaniesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const { can } = useAuth()
  const canDelete = can('companies.delete')

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => companiesApi.bulkDelete(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      toast.success('Companies deleted', { description: `${ids.length} compan${ids.length !== 1 ? 'ies' : 'y'} removed.` })
      setSelectedIds(new Set())
    },
    onError: () => {
      toast.error('Failed to delete companies', { description: 'Please try again.' })
    },
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(companies.map((c) => c.id)) : new Set())
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
            label={`compan${selectedIds.size !== 1 ? 'ies' : 'y'}`}
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
            entityLabel={selectedIds.size === 1 ? 'company' : 'companies'}
            onConfirm={handleBulkDeleteConfirm}
            isDeleting={bulkDelete.isPending}
          />
        </>
      )}
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={companies}
        searchPlaceholder="Search companies..."
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
          <div className="flex items-center gap-2">
            <Select value={industry} onValueChange={onIndustryChange ?? (() => { })}>
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
            <Select value={status} onValueChange={onStatusChange ?? (() => { })}>
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
    </div>
  )
}
