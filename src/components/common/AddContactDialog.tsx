import { useState } from 'react'
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

interface AddContactDialogProps {
  trigger?: React.ReactNode
}

export function AddContactDialog({ trigger }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Adding contact...')
    setOpen(false)
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
                <Input id="contactFirstName" placeholder="Jane" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactLastName">Last Name *</Label>
                <Input id="contactLastName" placeholder="Smith" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email *</Label>
              <Input id="contactEmail" type="email" placeholder="jane@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactCompany">Company</Label>
              <Input id="contactCompany" placeholder="Tech Solutions Inc" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPosition">Position</Label>
              <Input id="contactPosition" placeholder="VP of Sales" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Contact</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
