import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { companiesApi } from '@/api/companies'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'
import { INDUSTRY_OPTIONS, STATUS_OPTIONS } from '@/pages/companies/data'

interface AddCompanyDialogProps {
  trigger?: React.ReactNode
  /** After a successful create: modal is already closed; use for list refetch + loading on list pages. */
  onListReload?: () => void | Promise<void>
}

export function AddCompanyDialog({ trigger, onListReload }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [industry, setIndustry] = useState<string>('')
  const [status, setStatus] = useState<string>('prospect')
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  const createCompany = useMutation({
    mutationFn: (data: Parameters<typeof companiesApi.create>[0]) => companiesApi.create(data),
    onSuccess: async (_, variables) => {
      toast.success('Company added', {
        description: `${variables.name} has been added to your CRM.`,
      })
      formRef.current?.reset()
      setIndustry('')
      setStatus('prospect')
      setOpen(false)
      if (onListReload) {
        await onListReload()
      } else {
        queryClient.invalidateQueries({ queryKey: ['companies'], exact: false })
        queryClient.invalidateQueries({ queryKey: ['companies', 'stats'] })
      }
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
    onError: () => {
      toast.error('Failed to add company', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const name = (form.elements.namedItem('companyName') as HTMLInputElement).value.trim()
    const website = (form.elements.namedItem('companyWebsite') as HTMLInputElement).value.trim() || undefined
    const employeesRaw = (form.elements.namedItem('companyEmployees') as HTMLInputElement).value.trim()
    const employees = employeesRaw ? parseInt(employeesRaw, 10) : undefined
    const annualRevenueRaw = (form.elements.namedItem('companyAnnualRevenue') as HTMLInputElement).value.trim()
    const annualRevenue = annualRevenueRaw ? parseFloat(annualRevenueRaw.replace(/,/g, '')) : undefined
    const phone = (form.elements.namedItem('companyPhone') as HTMLInputElement).value.trim() || undefined
    const address = (form.elements.namedItem('companyAddress') as HTMLInputElement).value.trim() || undefined

    createCompany.mutate({
      name,
      ...(industry && { industry }),
      website,
      ...(status && { status }),
      ...(employees !== undefined && !isNaN(employees) && { employees }),
      ...(annualRevenue !== undefined && !isNaN(annualRevenue) && { annual_revenue: annualRevenue }),
      ...(phone && { phone }),
      ...(address && { address }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
            <DialogDescription>
              Add a new company to your CRM. Keep your organization records up to date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input id="companyName" name="companyName" placeholder="Acme Corp" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input id="companyWebsite" name="companyWebsite" placeholder="acmecorp.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyEmployees">Number of Employees</Label>
              <Input id="companyEmployees" name="companyEmployees" type="number" min={0} placeholder="e.g. 50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyAnnualRevenue">Annual Revenue</Label>
              <Input id="companyAnnualRevenue" name="companyAnnualRevenue" placeholder="e.g. 1500000.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <Input id="companyPhone" name="companyPhone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input id="companyAddress" name="companyAddress" placeholder="123 Main St, City, Country" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyIndustry">Industry</Label>
                <Select value={industry || 'none'} onValueChange={(v) => setIndustry(v === 'none' ? '' : v)}>
                  <SelectTrigger id="companyIndustry" className="w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {INDUSTRY_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyStatus">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="companyStatus" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCompany.isPending}>
              {createCompany.isPending ? 'Adding…' : 'Add Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
