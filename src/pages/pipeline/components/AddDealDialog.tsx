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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/common/DatePicker'
import { pipelineApi } from '@/api/pipeline'
import { FRONTEND_TO_API_STAGE } from '../apiMappers'
import { invalidateDashboardPipelineMetrics } from '@/pages/dashboard/queryKeys'
import { PIPELINE_STAGES, STAGE_CONFIG } from '../data'
import type { Stage } from '../typings'

const PIPELINE_DEALS_QUERY_KEY = ['pipeline', 'deals']

interface AddDealDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultStage?: string
  activePipelineId?: string
}

export function AddDealDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultStage = 'prospecting',
  activePipelineId,
}: AddDealDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [closeDate, setCloseDate] = useState<Date | undefined>()
  const [stage, setStage] = useState<Stage>((defaultStage as Stage) || 'prospecting')
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [probability, setProbability] = useState('')
  const [notes, setNotes] = useState('')

  const queryClient = useQueryClient()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const createDeal = useMutation({
    mutationFn: () =>
      pipelineApi.createDeal({
        name: name.trim(),
        stage: FRONTEND_TO_API_STAGE[stage],
        pipeline: activePipelineId || undefined,
        value: value ? String(parseFloat(value)) : undefined,
        probability: probability ? Number(probability) : undefined,
        expected_close_date: closeDate
          ? closeDate.toISOString().split('T')[0]
          : undefined,
        notes: notes.trim() || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_DEALS_QUERY_KEY })
      invalidateDashboardPipelineMetrics(queryClient)
      toast.success('Deal created', { description: `"${res.data.name}" has been added to your pipeline.` })
      resetForm()
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to create deal')
    },
  })

  function resetForm() {
    setName('')
    setValue('')
    setProbability('')
    setNotes('')
    setCloseDate(undefined)
    setStage((defaultStage as Stage) || 'prospecting')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    setOpen(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createDeal.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <Input
                id="dealName"
                placeholder="Enterprise CRM Migration"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Est. Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  min={0}
                  placeholder="50000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STAGE_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="closeDate">Expected Close</Label>
                <DatePicker
                  id="closeDate"
                  value={closeDate}
                  onChange={setCloseDate}
                  placeholder="Pick a date"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || createDeal.isPending}>
              {createDeal.isPending ? 'Adding...' : 'Add Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
