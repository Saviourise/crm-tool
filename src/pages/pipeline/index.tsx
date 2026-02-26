import { useState } from 'react'
import { PipelineHeader } from './components/PipelineHeader'
import { PipelineStats } from './components/PipelineStats'
import { KanbanBoard } from './components/KanbanBoard'
import { OpportunityList } from './components/OpportunityList'
import { MOCK_OPPORTUNITIES } from './data'
import type { Opportunity, PipelineView, Stage } from './typings'

export default function Pipeline() {
  const [view, setView] = useState<PipelineView>('kanban')
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES)

  const handleMoveOpportunity = (id: string, newStage: Stage) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, stage: newStage } : opp))
    )
  }

  return (
    <div className="space-y-6">
      <PipelineHeader
        total={opportunities.length}
        view={view}
        onViewChange={setView}
      />
      <PipelineStats opportunities={opportunities} />

      {view === 'kanban' ? (
        <KanbanBoard
          opportunities={opportunities}
          onMoveOpportunity={handleMoveOpportunity}
        />
      ) : (
        <OpportunityList opportunities={opportunities} />
      )}
    </div>
  )
}
