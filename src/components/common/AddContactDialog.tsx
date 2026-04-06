import { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contactsApi } from '@/api/contacts'
import { companiesApi } from '@/api/companies'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'

interface AddContactDialogProps {
  trigger?: React.ReactNode
  /** After a successful create: modal is already closed; use for list refetch + loading on list pages. */
  onListReload?: () => void | Promise<void>
}

export function AddContactDialog({ trigger, onListReload }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list({ limit: 200 }),
    enabled: open,
  })

  const companies = companiesData?.data?.results ?? []

  const createContact = useMutation({
    mutationFn: (data: Parameters<typeof contactsApi.create>[0]) => contactsApi.create(data),
    onSuccess: async (_, variables) => {
      toast.success('Contact added', {
        description: `${variables.first_name} ${variables.last_name} has been added to your CRM.`,
      })
      formRef.current?.reset()
      setCompanyId('')
      setOpen(false)
      if (onListReload) {
        await onListReload()
      } else {
        queryClient.invalidateQueries({ queryKey: ['contacts'], exact: false })
        queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] })
      }
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.contactsCount })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      toast.error('Failed to add contact', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const firstName = (form.elements.namedItem('contactFirstName') as HTMLInputElement).value.trim()
    const lastName = (form.elements.namedItem('contactLastName') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('contactEmail') as HTMLInputElement).value.trim()
    const position = (form.elements.namedItem('contactPosition') as HTMLInputElement).value.trim() || undefined
    const phone = (form.elements.namedItem('contactPhone') as HTMLInputElement).value.trim() || undefined

    createContact.mutate({
      first_name: firstName,
      last_name: lastName,
      email,
      ...(companyId && { company: companyId }),
      position,
      ...(phone && { phone }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your CRM. Keep your network organized.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactFirstName">First Name *</Label>
                <Input id="contactFirstName" name="contactFirstName" placeholder="Jane" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactLastName">Last Name *</Label>
                <Input id="contactLastName" name="contactLastName" placeholder="Smith" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email *</Label>
              <Input id="contactEmail" name="contactEmail" type="email" placeholder="jane@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactCompany">Company</Label>
              <Select value={companyId || 'none'} onValueChange={(v) => setCompanyId(v === 'none' ? '' : v)} disabled={companiesLoading}>
                <SelectTrigger id="contactCompany" className="w-full">
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
              <Label htmlFor="contactPosition">Position</Label>
              <Input id="contactPosition" name="contactPosition" placeholder="VP of Sales" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createContact.isPending}>
              {createContact.isPending ? 'Adding…' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
