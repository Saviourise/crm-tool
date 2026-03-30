import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { leadsApi } from '@/api/leads'
import { companiesApi } from '@/api/companies'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'

interface CreateLeadDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** After a successful create: modal is already closed; use for list refetch + loading on list pages. */
  onListReload?: () => void | Promise<void>
}

const SOURCE_MAP: Record<string, string> = {
  website: 'website',
  referral: 'referral',
  social: 'social_media',
  email: 'email_campaign',
  phone: 'cold_call',
  event: 'event',
  other: 'other',
}

export function CreateLeadDialog({ trigger, open: controlledOpen, onOpenChange, onListReload }: CreateLeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [source, setSource] = useState('website')
  const [status, setStatus] = useState('new')
  const [companyId, setCompanyId] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list({ limit: 200 }),
    enabled: open,
  })

  const companies = companiesData?.data?.results ?? []

  useEffect(() => {
    if (!open) setCompanyId('')
  }, [open])

  const createLead = useMutation({
    mutationFn: (data: Parameters<typeof leadsApi.create>[0]) => leadsApi.create(data),
    onSuccess: async (_, variables) => {
      toast.success('Lead created', {
        description: `${variables.first_name} ${variables.last_name} has been added to your pipeline.`,
      })
      formRef.current?.reset()
      setSource('website')
      setStatus('new')
      setCompanyId('')
      setOpen(false)
      if (onListReload) {
        await onListReload()
      } else {
        queryClient.invalidateQueries({ queryKey: ['leads'], exact: false })
        queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] })
      }
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.leadAnalytics })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: () => {
      toast.error('Failed to create lead', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value.trim()
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const position = (form.elements.namedItem('position') as HTMLInputElement).value.trim() || undefined
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim() || undefined

    createLead.mutate({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      ...(companyId && { company: companyId }),
      position,
      source: SOURCE_MAP[source] ?? 'website',
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to your pipeline. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" placeholder="John" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" placeholder="john@company.com" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Select value={companyId || 'none'} onValueChange={(v) => setCompanyId(v === 'none' ? '' : v)} disabled={companiesLoading}>
                  <SelectTrigger id="company" className="w-full">
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
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" placeholder="CEO" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? 'Creating…' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
