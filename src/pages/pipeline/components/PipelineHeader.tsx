import { Plus, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddDealDialog } from './AddDealDialog'
import type { PipelineView } from '../typings'

interface PipelineHeaderProps {
  total: number
  view: PipelineView
  onViewChange: (view: PipelineView) => void
}

export function PipelineHeader({ total, view, onViewChange }: PipelineHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          {total} deal{total !== 1 ? 's' : ''} across all stages
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="flex rounded-md border overflow-hidden">
          <Button
            variant={view === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none border-0 gap-1.5"
            onClick={() => onViewChange('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none border-0 gap-1.5"
            onClick={() => onViewChange('list')}
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>

        <AddDealDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </Button>
          }
        />
      </div>
    </div>
  )
}
