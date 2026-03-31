import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PipelineHeader } from './components/PipelineHeader'
import { PipelineStats } from './components/PipelineStats'
import { KanbanBoard } from './components/KanbanBoard'
import { OpportunityList } from './components/OpportunityList'
import { PipelineSelector } from './components/PipelineSelector'
import { PipelineFiltersBar } from './components/PipelineFiltersBar'
import { DEFAULT_BOARD_CONFIG } from './data'
import { pipelineApi } from '@/api/pipeline'
import {
  mapApiDealToOpportunity,
  mapApiPipelineToPipeline,
  mapApiSavedViewToSavedView,
  FRONTEND_TO_API_STAGE,
} from './apiMappers'
import { dashboardQueryKeys, invalidateDashboardPipelineMetrics } from '@/pages/dashboard/queryKeys'
import type { PipelineView, Stage, BoardConfig, PipelineFilters, SavedView, Opportunity } from './typings'

export const PIPELINE_DEALS_QUERY_KEY = ['pipeline', 'deals']
export const PIPELINE_PIPELINES_QUERY_KEY = ['pipeline', 'pipelines']
export const PIPELINE_SAVED_VIEWS_QUERY_KEY = ['pipeline', 'saved-views']

// ─── Create Pipeline Dialog ────────────────────────────────────────────────────

function CreatePipelineDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const createPipeline = useMutation({
    mutationFn: () => pipelineApi.createPipeline({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_PIPELINES_QUERY_KEY })
      toast.success('Pipeline created', { description: `"${res.data.name}" pipeline is ready.` })
      setName('')
      setDescription('')
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to create pipeline')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createPipeline.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Pipeline</DialogTitle>
            <DialogDescription>Create a new pipeline to track a separate set of deals.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pipeline-name">Pipeline Name</Label>
              <Input
                id="pipeline-name"
                placeholder="e.g. Enterprise Deals"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pipeline-desc">Description</Label>
              <Input
                id="pipeline-desc"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || createPipeline.isPending}>
              {createPipeline.isPending ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Client-side filter helper ────────────────────────────────────────────────

function applyFilters(opps: Opportunity[], filters: PipelineFilters): Opportunity[] {
  return opps.filter((opp) => {
    if (filters.minValue && opp.value < Number(filters.minValue)) return false
    if (filters.maxValue && opp.value > Number(filters.maxValue)) return false
    if (filters.assignees.length > 0 && !filters.assignees.includes(opp.assignedToId ?? '')) return false
    if (filters.minProbability > 0 && opp.probability < filters.minProbability) return false
    return true
  })
}

// ─── Main Component ────────────────────────────────────────────────────────────

const EMPTY_FILTERS: PipelineFilters = {
  assignees: [],
  minValue: '',
  maxValue: '',
  closeDateFrom: '',
  closeDateTo: '',
  minProbability: 0,
}

export default function Pipeline() {
  const queryClient = useQueryClient()

  const [view, setView] = useState<PipelineView>('kanban')
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(DEFAULT_BOARD_CONFIG)
  const [activePipelineId, setActivePipelineId] = useState<string>('')
  const [filters, setFilters] = useState<PipelineFilters>(EMPTY_FILTERS)
  const [createPipelineOpen, setCreatePipelineOpen] = useState(false)

  // Optimistic stage overrides for drag-and-drop
  const [stageOverrides, setStageOverrides] = useState<Record<string, Stage>>({})

  // ─── Data fetching ────────────────────────────────────────────────────────

  const { data: pipelinesRes, isLoading: pipelinesLoading } = useQuery({
    queryKey: PIPELINE_PIPELINES_QUERY_KEY,
    queryFn: () => pipelineApi.listPipelines(),
  })

  // API may return plain array or paginated { results: [] }
  const rawPipelines = (() => {
    const d = pipelinesRes?.data
    if (!d) return []
    if (Array.isArray(d)) return d
    return (d as unknown as { results: typeof d }).results ?? []
  })()

  // Set default active pipeline when pipelines load
  useEffect(() => {
    if (!activePipelineId && rawPipelines.length > 0) {
      const defaultPipeline = rawPipelines.find((p) => p.is_default) ?? rawPipelines[0]
      setActivePipelineId(defaultPipeline.id)
    }
  }, [rawPipelines, activePipelineId])

  const { data: dealsRes, isLoading: dealsLoading, isFetching: dealsFetching } = useQuery({
    queryKey: [...PIPELINE_DEALS_QUERY_KEY, activePipelineId],
    queryFn: () => pipelineApi.listDeals({ pipeline: activePipelineId, limit: 200 }),
    enabled: !!activePipelineId,
  })

  const { data: savedViewsRes, isLoading: savedViewsLoading } = useQuery({
    queryKey: PIPELINE_SAVED_VIEWS_QUERY_KEY,
    queryFn: () => pipelineApi.listSavedViews(),
  })

  const apiOpportunities = useMemo(
    () => (dealsRes?.data?.results ?? []).map(mapApiDealToOpportunity),
    [dealsRes]
  )

  // Apply optimistic stage overrides for smooth drag-and-drop UX
  const opportunities = useMemo(
    () =>
      apiOpportunities.map((opp) =>
        stageOverrides[opp.id] ? { ...opp, stage: stageOverrides[opp.id] } : opp
      ),
    [apiOpportunities, stageOverrides]
  )

  // Remove an override only once the refetched server data confirms the new stage.
  // This prevents the card from snapping back to the old stage during the in-flight refetch.
  useEffect(() => {
    if (Object.keys(stageOverrides).length === 0) return
    setStageOverrides((prev) => {
      const next = { ...prev }
      let changed = false
      for (const id of Object.keys(next)) {
        const serverOpp = apiOpportunities.find((o) => o.id === id)
        if (serverOpp && serverOpp.stage === next[id]) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [apiOpportunities])

  const pipelines = useMemo(
    () =>
      rawPipelines.map((p) => {
        const dealCount = p.id === activePipelineId ? opportunities.length : 0
        return mapApiPipelineToPipeline(p, dealCount)
      }),
    [rawPipelines, opportunities, activePipelineId]
  )

  const savedViews = useMemo(() => {
    const d = savedViewsRes?.data
    if (!d) return []
    const arr = Array.isArray(d) ? d : (d as unknown as { results: typeof d }).results ?? []
    return arr.map(mapApiSavedViewToSavedView)
  }, [savedViewsRes])

  const filteredOpportunities = applyFilters(opportunities, filters)

  // ─── Mutations ────────────────────────────────────────────────────────────

  const moveStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: Stage }) =>
      pipelineApi.moveStage(id, FRONTEND_TO_API_STAGE[stage]),
    onSuccess: () => {
      // Override stays in place until the refetch confirms the new stage (see useEffect above).
      queryClient.invalidateQueries({ queryKey: [...PIPELINE_DEALS_QUERY_KEY, activePipelineId] })
      invalidateDashboardPipelineMetrics(queryClient)
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity })
    },
    onError: (_, { id }) => {
      // Revert the optimistic override so the card snaps back to the original stage.
      setStageOverrides((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast.error('Failed to move deal')
    },
  })

  const createSavedView = useMutation({
    mutationFn: (name: string) =>
      pipelineApi.createSavedView({
        name,
        entity_type: 'deal',
        filters: filters as unknown as Record<string, unknown>,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_SAVED_VIEWS_QUERY_KEY })
      toast.success('View saved', { description: `"${res.data.name}" has been saved.` })
    },
    onError: () => {
      toast.error('Failed to save view')
    },
  })

  // ─── Event handlers ───────────────────────────────────────────────────────

  const handleMoveOpportunity = (id: string, newStage: Stage) => {
    setStageOverrides((prev) => ({ ...prev, [id]: newStage }))
    moveStage.mutate({ id, stage: newStage })
  }

  const handleSaveView = (name: string) => {
    createSavedView.mutate(name)
  }

  const handleLoadView = (savedView: SavedView) => {
    setFilters(savedView.filters)
    toast.info('View loaded', { description: `Showing "${savedView.name}" filter.` })
  }

  const isLoading = pipelinesLoading || (!!activePipelineId && dealsLoading)
  // Show loading overlay on board/list for initial fetch and after modal mutations (not drag-and-drop)
  const isDragging = Object.keys(stageOverrides).length > 0
  const showDealsLoading = !!activePipelineId && (dealsLoading || (dealsFetching && !isDragging))

  return (
    <div className="space-y-4">
      <PipelineHeader
        total={filteredOpportunities.length}
        view={view}
        onViewChange={setView}
        config={boardConfig}
        onConfigChange={setBoardConfig}
        activePipelineId={activePipelineId}
        isLoading={isLoading}
        pipelineSelector={
          <PipelineSelector
            pipelines={pipelines}
            activePipelineId={activePipelineId}
            onSelect={setActivePipelineId}
            onNewPipeline={() => setCreatePipelineOpen(true)}
          />
        }
      />

      <PipelineStats opportunities={filteredOpportunities} />

      <PipelineFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        savedViews={savedViews}
        savedViewsLoading={savedViewsLoading}
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
      />

      {view === 'kanban' ? (
        <div className="-mx-4 md:-mx-6 lg:-mx-8">
          <KanbanBoard
            opportunities={filteredOpportunities}
            config={boardConfig}
            activePipelineId={activePipelineId}
            onMoveOpportunity={handleMoveOpportunity}
            isLoading={showDealsLoading}
          />
        </div>
      ) : (
        <OpportunityList
          opportunities={filteredOpportunities}
          activePipelineId={activePipelineId}
          isLoading={showDealsLoading}
        />
      )}

      <CreatePipelineDialog open={createPipelineOpen} onOpenChange={setCreatePipelineOpen} />
    </div>
  )
}
