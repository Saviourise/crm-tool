import { useState } from 'react'
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
import {
  MOCK_OPPORTUNITIES,
  DEFAULT_BOARD_CONFIG,
  MOCK_PIPELINES,
  MOCK_SAVED_VIEWS,
} from './data'
import type { Opportunity, PipelineView, Stage, BoardConfig, PipelineFilters, SavedView } from './typings'

// ─── Create Pipeline Dialog ────────────────────────────────────────────────────

function CreatePipelineDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    toast.success('Pipeline created', { description: `"${name.trim()}" pipeline is ready.` })
    setName('')
    setDescription('')
    onOpenChange(false)
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
            <Button type="submit" disabled={!name.trim()}>Create Pipeline</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Pipeline filtering by pipeline ID ────────────────────────────────────────

function getOpportunitiesForPipeline(pipelineId: string, allOpps: Opportunity[]): Opportunity[] {
  if (pipelineId === '2') {
    // Enterprise Deals: negotiation + closed-won stages
    return allOpps.filter(
      (o) => o.stage === 'negotiation' || o.stage === 'closed-won'
    )
  }
  if (pipelineId === '3') {
    // Partnerships: everything not in pipeline 1 or 2
    const p2Ids = new Set(
      allOpps.filter(
        (o) => o.stage === 'negotiation' || o.stage === 'closed-won'
      ).map((o) => o.id)
    )
    const first12Ids = new Set(allOpps.slice(0, 12).map((o) => o.id))
    return allOpps.filter(
      (o) => !p2Ids.has(o.id) && !first12Ids.has(o.id)
    )
  }
  // Default pipeline 1: first 12
  return allOpps.slice(0, 12)
}

function applyFilters(opps: Opportunity[], filters: PipelineFilters): Opportunity[] {
  return opps.filter((opp) => {
    if (filters.minValue && opp.value < Number(filters.minValue)) return false
    if (filters.maxValue && opp.value > Number(filters.maxValue)) return false
    if (filters.assignees.length > 0 && !filters.assignees.includes(opp.assignedTo)) return false
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
  const [view, setView] = useState<PipelineView>('kanban')
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES)
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(DEFAULT_BOARD_CONFIG)
  const [activePipelineId, setActivePipelineId] = useState('1')
  const [filters, setFilters] = useState<PipelineFilters>(EMPTY_FILTERS)
  const [savedViews, setSavedViews] = useState<SavedView[]>(MOCK_SAVED_VIEWS)
  const [createPipelineOpen, setCreatePipelineOpen] = useState(false)

  const handleMoveOpportunity = (id: string, newStage: Stage) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, stage: newStage } : opp))
    )
  }

  const pipelineOpps = getOpportunitiesForPipeline(activePipelineId, opportunities)
  const filteredOpportunities = applyFilters(pipelineOpps, filters)

  const handleSaveView = (name: string) => {
    const newView: SavedView = {
      id: String(Date.now()),
      name,
      filters: { ...filters },
    }
    setSavedViews((prev) => [...prev, newView])
    toast.success('View saved', { description: `"${name}" has been saved.` })
  }

  const handleLoadView = (savedView: SavedView) => {
    setFilters(savedView.filters)
    toast.info('View loaded', { description: `Showing "${savedView.name}" filter.` })
  }

  return (
    <div className="space-y-4">
      <PipelineHeader
        total={filteredOpportunities.length}
        view={view}
        onViewChange={setView}
        config={boardConfig}
        onConfigChange={setBoardConfig}
        pipelineSelector={
          <PipelineSelector
            pipelines={MOCK_PIPELINES}
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
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
      />

      {view === 'kanban' ? (
        <div className="-mx-4 md:-mx-6 lg:-mx-8">
          <KanbanBoard
            opportunities={filteredOpportunities}
            config={boardConfig}
            onMoveOpportunity={handleMoveOpportunity}
          />
        </div>
      ) : (
        <OpportunityList opportunities={filteredOpportunities} />
      )}

      <CreatePipelineDialog open={createPipelineOpen} onOpenChange={setCreatePipelineOpen} />
    </div>
  )
}
