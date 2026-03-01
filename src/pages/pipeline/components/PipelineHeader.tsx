import type React from 'react'
import { Plus, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddDealDialog } from './AddDealDialog'
import { BoardConfigSheet } from './BoardConfigSheet'
import type { PipelineView, BoardConfig } from '../typings'
import { useAuth } from '@/auth/context'

interface PipelineHeaderProps {
  total: number
  view: PipelineView
  onViewChange: (view: PipelineView) => void
  config: BoardConfig
  onConfigChange: (config: BoardConfig) => void
  pipelineSelector?: React.ReactNode
}

export function PipelineHeader({ total, view, onViewChange, config, onConfigChange, pipelineSelector }: PipelineHeaderProps) {
  const { can } = useAuth()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          {total} deal{total !== 1 ? 's' : ''} across all stages
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {pipelineSelector}
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

        {/* Board config — only shown in kanban view for users who can edit */}
        {view === 'kanban' && can('pipeline.edit') && (
          <BoardConfigSheet
            config={config}
            onConfigChange={onConfigChange}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                Configure
              </Button>
            }
          />
        )}

        {can('pipeline.create') && (
          <AddDealDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
