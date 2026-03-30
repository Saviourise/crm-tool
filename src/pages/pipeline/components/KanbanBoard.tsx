import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Link } from 'react-router-dom'
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
import { LogActivityDialog } from '@/components/common/LogActivityDialog'
import { cn } from '@/lib/utils'
import { currencyFormat } from '../utils'
import { PIPELINE_STAGES, STAGE_CONFIG, STAGE_COLORS } from '../data'
import { AddDealDialog } from './AddDealDialog'
import type { Opportunity, Stage, BoardConfig, ColorConfig, CardFieldSettings, StageSettings } from '../typings'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/auth/context'
import { pipelineApi } from '@/api/pipeline'
import { FRONTEND_TO_API_STAGE } from '../apiMappers'
import { dashboardQueryKeys, invalidateDashboardPipelineMetrics } from '@/pages/dashboard/queryKeys'

const PIPELINE_DEALS_QUERY_KEY = ['pipeline', 'deals']

// ─── Edit Deal Dialog ─────────────────────────────────────────────────────────

function EditDealDialog({ opportunity, open, onOpenChange }: {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(opportunity.name)
  const [value, setValue] = useState(String(opportunity.value))
  const [probability, setProbability] = useState(String(opportunity.probability))
  const [stage, setStage] = useState<Stage>(opportunity.stage)
  const [notes, setNotes] = useState(opportunity.notes ?? '')

  const updateDeal = useMutation({
    mutationFn: () =>
      pipelineApi.updateDeal(opportunity.id, {
        name: name.trim(),
        value: value ? String(parseFloat(value)) : undefined,
        probability: probability ? Number(probability) : undefined,
        stage: FRONTEND_TO_API_STAGE[stage],
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_DEALS_QUERY_KEY })
      invalidateDashboardPipelineMetrics(queryClient)
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      toast.success('Deal updated', { description: `"${name.trim()}" has been updated.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to update deal')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateDeal.mutate()
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
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-value">Value ($)</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-probability">Probability (%)</Label>
                <Input
                  id="edit-probability"
                  type="number"
                  min={0}
                  max={100}
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage">Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                <SelectTrigger id="edit-stage">
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
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || updateDeal.isPending}>
              {updateDeal.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
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
  const queryClient = useQueryClient()

  const deleteDeal = useMutation({
    mutationFn: () => pipelineApi.deleteDeal(opportunity.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_DEALS_QUERY_KEY })
      invalidateDashboardPipelineMetrics(queryClient)
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
      toast.error('Deal deleted', { description: `"${opportunity.name}" has been removed.` })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to delete deal')
    },
  })

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
            disabled={deleteDeal.isPending}
            onClick={() => deleteDeal.mutate()}
          >
            {deleteDeal.isPending ? 'Deleting...' : 'Delete Deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Deal Card Content ────────────────────────────────────────────────────────

function DealCardContent({
  opportunity,
  colorConfig,
  cardFields,
  dragListeners,
  isOverlay = false,
}: {
  opportunity: Opportunity
  colorConfig: ColorConfig
  cardFields: CardFieldSettings
  dragListeners?: Record<string, unknown>
  isOverlay?: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const { can } = useAuth()

  const canEdit = can('pipeline.edit')
  const canDelete = can('pipeline.delete')
  const hasWriteAccess = canEdit || canDelete

  const assigneeInitials = opportunity.assignedTo
    .split(' ')
    .map((n) => n[0])
    .join('')

  const showFooter = cardFields.closeDate || cardFields.assignee

  return (
    <div className={cn('bg-card rounded-lg border border-border/60 shadow-sm', colorConfig.cardBorderClass)}>
      <div className="p-3">
        {/* Drag handle + actions */}
        <div className="flex items-start justify-between mb-2">
          <button
            {...(dragListeners ?? {})}
            className={cn(
              'text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-0.5',
              isOverlay ? 'cursor-grabbing' : 'cursor-grab'
            )}
            tabIndex={-1}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {!isOverlay && hasWriteAccess && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Deal
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setTaskOpen(true)}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Create Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLogOpen(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Log Activity
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Deal
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Deal name */}
        {isOverlay ? (
          <p className="font-semibold text-sm leading-snug mb-0.5 line-clamp-2">{opportunity.name}</p>
        ) : (
          <Link
            to={ROUTES.DEAL_DETAIL(opportunity.id)}
            className="font-semibold text-sm leading-snug mb-0.5 line-clamp-2 hover:text-primary hover:underline block"
          >
            {opportunity.name}
          </Link>
        )}

        {/* Company */}
        {cardFields.company && opportunity.company !== '—' && (
          <p className="text-xs text-muted-foreground mb-2">{opportunity.company}</p>
        )}

        {/* Value */}
        {cardFields.value && (
          <p className={cn('text-base font-bold mb-2', colorConfig.textColor)}>
            {currencyFormat.format(opportunity.value)}
          </p>
        )}

        {/* Probability bar */}
        {cardFields.probability && (
          <div className="flex items-center gap-2 mb-2">
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
        )}

        {/* Footer: close date + assignee */}
        {showFooter && (
          <div className="flex items-center justify-between mt-1">
            {cardFields.closeDate ? (
              <span className="text-xs text-muted-foreground">{opportunity.expectedCloseDate}</span>
            ) : (
              <span />
            )}
            {cardFields.assignee && opportunity.assignedTo !== '—' && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                  {assigneeInitials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}
      </div>

      {!isOverlay && (
        <>
          <EditDealDialog opportunity={opportunity} open={editOpen} onOpenChange={setEditOpen} />
          <DeleteDealDialog opportunity={opportunity} open={deleteOpen} onOpenChange={setDeleteOpen} />
          <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
          <LogActivityDialog open={logOpen} onOpenChange={setLogOpen} entityName={opportunity.name} dealId={opportunity.id} />
        </>
      )}
    </div>
  )
}

// ─── Draggable Deal Card ──────────────────────────────────────────────────────

function DealCard({
  opportunity,
  colorConfig,
  cardFields,
}: {
  opportunity: Opportunity
  colorConfig: ColorConfig
  cardFields: CardFieldSettings
}) {
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
      <DealCardContent
        opportunity={opportunity}
        colorConfig={colorConfig}
        cardFields={cardFields}
        dragListeners={listeners}
      />
    </div>
  )
}

// ─── Droppable Kanban Column ──────────────────────────────────────────────────

function KanbanColumn({
  settings,
  opportunities,
  cardFields,
  columnWidth,
  canCreate,
  activePipelineId,
}: {
  settings: StageSettings
  opportunities: Opportunity[]
  cardFields: CardFieldSettings
  columnWidth: number
  canCreate: boolean
  activePipelineId?: string
}) {
  const colorConfig = STAGE_COLORS[settings.color]
  const { setNodeRef, isOver } = useDroppable({ id: settings.stage })

  const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0)

  return (
    <div className="flex flex-col shrink-0" style={{ width: columnWidth }}>
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: colorConfig.dot }}
          />
          <span className={cn('text-sm font-semibold', colorConfig.textColor)}>
            {settings.label}
          </span>
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
          'flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-all border-2 border-dashed border-transparent',
          colorConfig.columnBgClass,
          isOver && 'border-primary/40 bg-primary/10'
        )}
      >
        {opportunities.map((opp) => (
          <DealCard
            key={opp.id}
            opportunity={opp}
            colorConfig={colorConfig}
            cardFields={cardFields}
          />
        ))}

        {canCreate && (
          <AddDealDialog
            defaultStage={settings.stage}
            activePipelineId={activePipelineId}
            trigger={
              <button className="w-full flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add deal
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}

// ─── Main Kanban Board ────────────────────────────────────────────────────────

interface KanbanBoardProps {
  opportunities: Opportunity[]
  config: BoardConfig
  activePipelineId?: string
  onMoveOpportunity: (id: string, newStage: Stage) => void
}

export function KanbanBoard({ opportunities, config, activePipelineId, onMoveOpportunity }: KanbanBoardProps) {
  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null)
  const { can } = useAuth()
  const canCreate = can('pipeline.create')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const visibleStages = config.stages.filter((s) => s.visible)

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveOpp(
      (active.data.current as { opportunity: Opportunity } | undefined)?.opportunity ?? null
    )
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveOpp(null)
    if (!over) return

    const newStage = over.id as Stage
    const draggedOpp = opportunities.find((o) => o.id === String(active.id))
    if (!draggedOpp || draggedOpp.stage === newStage) return

    // Use the configured label for the stage name in the toast
    const stageName =
      config.stages.find((s) => s.stage === newStage)?.label ?? newStage

    toast.success('Deal moved', {
      description: `"${draggedOpp.name}" moved to ${stageName}.`,
    })
    onMoveOpportunity(String(active.id), newStage)
  }

  // Resolve color config for the DragOverlay
  const activeStageSettings = activeOpp
    ? config.stages.find((s) => s.stage === activeOpp.stage)
    : null
  const activeColorConfig = STAGE_COLORS[activeStageSettings?.color ?? 'blue']

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveOpp(null)}
    >
      <div className="kanban-scroll flex gap-3 overflow-x-auto px-4 md:px-6 lg:px-8 pt-1 pb-5">
        {visibleStages.map((settings) => (
          <KanbanColumn
            key={settings.stage}
            settings={settings}
            opportunities={opportunities.filter((o) => o.stage === settings.stage)}
            cardFields={config.cardFields}
            columnWidth={config.columnWidth}
            canCreate={canCreate}
            activePipelineId={activePipelineId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeOpp && (
          <div className="rotate-2 opacity-95 shadow-xl" style={{ width: config.columnWidth }}>
            <DealCardContent
              opportunity={activeOpp}
              colorConfig={activeColorConfig}
              cardFields={config.cardFields}
              isOverlay
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
