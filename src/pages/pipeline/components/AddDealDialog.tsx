import { useState } from 'react'
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
import { PIPELINE_STAGES, STAGE_CONFIG } from '../data'

interface AddDealDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultStage?: string
}

export function AddDealDialog({ trigger, open: controlledOpen, onOpenChange, defaultStage = 'prospecting' }: AddDealDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem('dealName') as HTMLInputElement).value
    toast.success('Deal created', { description: `"${name}" has been added to your pipeline.` })
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Create a new opportunity and add it to your pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dealName">Deal Name *</Label>
              <Input id="dealName" name="dealName" placeholder="Enterprise CRM Migration" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" name="company" placeholder="Acme Corp" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Name</Label>
                <Input id="contact" name="contact" placeholder="John Smith" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Est. Value ($)</Label>
                <Input id="value" name="value" type="number" min={0} placeholder="50000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input id="probability" name="probability" type="number" min={0} max={100} placeholder="50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stage">Stage</Label>
                <Select name="stage" defaultValue={defaultStage}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {STAGE_CONFIG[stage].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="closeDate">Expected Close</Label>
                <Input id="closeDate" name="closeDate" type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input id="assignedTo" name="assignedTo" placeholder="Sarah K." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Deal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
