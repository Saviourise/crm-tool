import { useState } from 'react'
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
import { contactsApi } from '@/api/crm'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'

interface AddContactDialogProps {
  trigger?: React.ReactNode
}

export function AddContactDialog({ trigger }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const createContact = useMutation({
    mutationFn: (data: Parameters<typeof contactsApi.create>[0]) => contactsApi.create(data),
    onSuccess: (_, variables) => {
      toast.success('Contact added', {
        description: `${variables.first_name} ${variables.last_name} has been added to your CRM.`,
      })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.contactsCount })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to add contact', { description: 'Please try again.' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const firstName = (form.elements.namedItem('contactFirstName') as HTMLInputElement).value.trim()
    const lastName = (form.elements.namedItem('contactLastName') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('contactEmail') as HTMLInputElement).value.trim()
    const position = (form.elements.namedItem('contactPosition') as HTMLInputElement).value.trim() || undefined
    // company: API expects UUID; omit for quick-add (user can link later via contact edit)
    const companyVal = (form.elements.namedItem('contactCompany') as HTMLInputElement).value.trim()
    const company = /^[0-9a-f-]{36}$/i.test(companyVal) ? companyVal : undefined

    createContact.mutate({
      first_name: firstName,
      last_name: lastName,
      email,
      ...(company && { company }),
      position,
    })
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
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
              <Input id="contactCompany" name="contactCompany" placeholder="Tech Solutions Inc" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPosition">Position</Label>
              <Input id="contactPosition" name="contactPosition" placeholder="VP of Sales" />
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
