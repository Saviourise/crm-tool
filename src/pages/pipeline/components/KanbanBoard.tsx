import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { GripVertical, MoreHorizontal, Plus, Pencil, CheckSquare, Clock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { cn } from '@/lib/utils'
import { currencyFormat } from '../utils'
import { PIPELINE_STAGES, STAGE_CONFIG } from '../data'
import { AddDealDialog } from './AddDealDialog'
import type { Opportunity, Stage } from '../typings'

// ─── Edit Deal Dialog ────────────────────────────────────────────────────────

function EditDealDialog({ opportunity, open, onOpenChange }: {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Deal updated', { description: `"${opportunity.name}" has been updated.` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>Update the details for "{opportunity.name}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Deal Name</Label>
              <Input id="edit-name" defaultValue={opportunity.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input id="edit-company" defaultValue={opportunity.company} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contact">Contact</Label>
                <Input id="edit-contact" defaultValue={opportunity.contact} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-value">Value ($)</Label>
                <Input id="edit-value" type="number" defaultValue={opportunity.value} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-probability">Probability (%)</Label>
                <Input id="edit-probability" type="number" min={0} max={100} defaultValue={opportunity.probability} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stage">Stage</Label>
                <Select defaultValue={opportunity.stage}>
                  <SelectTrigger id="edit-stage">
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
                <Label htmlFor="edit-assigned">Assigned To</Label>
                <Input id="edit-assigned" defaultValue={opportunity.assignedTo} />
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

function DeleteDealDialog({ opportunity, open, onOpenChange }: {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{opportunity.name}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              toast.error('Deal deleted', { description: `"${opportunity.name}" has been removed.` })
              onOpenChange(false)
            }}
          >
            Delete Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Deal Card Content (shared between card and overlay) ──────────────────────

function DealCardContent({
  opportunity,
  dragListeners,
  isOverlay = false,
}: {
  opportunity: Opportunity
  dragListeners?: Record<string, unknown>
  isOverlay?: boolean
}) {
  const config = STAGE_CONFIG[opportunity.stage]
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  const assigneeInitials = opportunity.assignedTo
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className={cn('bg-card rounded-lg border border-border/60 shadow-sm', config.cardBorderClass)}>
      <div className="p-3">
        {/* Header: drag handle + actions */}
        <div className="flex items-start justify-between mb-2">
          <button
            {...(dragListeners ?? {})}
            className={cn(
              'text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-0.5',
              isOverlay ? 'cursor-grabbing' : 'cursor-grab'
            )}
            tabIndex={-1}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {!isOverlay && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Deal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTaskOpen(true)}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Create Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Activity logged', { description: `Activity logged for "${opportunity.name}".` })}>
                  <Clock className="h-4 w-4 mr-2" />
                  Log Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Deal name + company */}
        <p className="font-semibold text-sm leading-snug mb-0.5 line-clamp-2">{opportunity.name}</p>
        <p className="text-xs text-muted-foreground mb-3">{opportunity.company}</p>

        {/* Value */}
        <p className={cn('text-base font-bold mb-2', config.textColor)}>
          {currencyFormat.format(opportunity.value)}
        </p>

        {/* Probability bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${opportunity.probability}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-7 text-right">
            {opportunity.probability}%
          </span>
        </div>

        {/* Footer: close date + assignee */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{opportunity.expectedCloseDate}</span>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {assigneeInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {!isOverlay && (
        <>
          <EditDealDialog opportunity={opportunity} open={editOpen} onOpenChange={setEditOpen} />
          <DeleteDealDialog opportunity={opportunity} open={deleteOpen} onOpenChange={setDeleteOpen} />
          <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
        </>
      )}
    </div>
  )
}

// ─── Draggable Deal Card ──────────────────────────────────────────────────────

function DealCard({ opportunity }: { opportunity: Opportunity }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={cn('transition-opacity', isDragging && 'opacity-30')}
    >
      <DealCardContent opportunity={opportunity} dragListeners={listeners} />
    </div>
  )
}

// ─── Droppable Kanban Column ──────────────────────────────────────────────────

function KanbanColumn({
  stage,
  opportunities,
}: {
  stage: Stage
  opportunities: Opportunity[]
}) {
  const config = STAGE_CONFIG[stage]
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0)

  return (
    <div className="flex flex-col w-[272px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', config.textColor)}>{config.label}</span>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {opportunities.length}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {currencyFormat.format(totalValue)}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors border-2 border-dashed border-transparent',
          config.columnBgClass,
          isOver && 'border-primary/40 bg-primary/10'
        )}
      >
        {opportunities.map((opp) => (
          <DealCard key={opp.id} opportunity={opp} />
        ))}

        <AddDealDialog
          defaultStage={stage}
          trigger={
            <button className="w-full flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              Add deal
            </button>
          }
        />
      </div>
    </div>
  )
}

// ─── Main Kanban Board ────────────────────────────────────────────────────────

interface KanbanBoardProps {
  opportunities: Opportunity[]
  onMoveOpportunity: (id: string, newStage: Stage) => void
}

export function KanbanBoard({ opportunities, onMoveOpportunity }: KanbanBoardProps) {
  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveOpp((active.data.current as { opportunity: Opportunity } | undefined)?.opportunity ?? null)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveOpp(null)
    if (!over) return

    const newStage = over.id as Stage
    const draggedOpp = opportunities.find((o) => o.id === String(active.id))
    if (!draggedOpp || draggedOpp.stage === newStage) return

    toast.success('Deal moved', {
      description: `"${draggedOpp.name}" moved to ${STAGE_CONFIG[newStage].label}.`,
    })
    onMoveOpportunity(String(active.id), newStage)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveOpp(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            opportunities={opportunities.filter((o) => o.stage === stage)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeOpp && (
          <div className="rotate-2 opacity-95 shadow-xl">
            <DealCardContent opportunity={activeOpp} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
