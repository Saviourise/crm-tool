import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Pipeline } from '../typings'

interface PipelineSelectorProps {
  pipelines: Pipeline[]
  activePipelineId: string
  onSelect: (id: string) => void
  onNewPipeline: () => void
}

function formatValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export function PipelineSelector({ pipelines, activePipelineId, onSelect, onNewPipeline }: PipelineSelectorProps) {
  const [open, setOpen] = useState(false)
  const activePipeline = pipelines.find((p) => p.id === activePipelineId) ?? pipelines[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <span className="font-medium">{activePipeline?.name ?? 'Select Pipeline'}</span>
          <Badge variant="secondary" className="text-xs h-5 px-1.5 ml-0.5">
            {activePipeline?.dealCount ?? 0}
          </Badge>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1">
        <div className="space-y-0.5">
          {pipelines.map((pipeline) => {
            const isSelected = pipeline.id === activePipelineId
            return (
              <button
                key={pipeline.id}
                type="button"
                onClick={() => {
                  onSelect(pipeline.id)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-start justify-between gap-3 px-3 py-2.5 rounded-md text-left transition-colors',
                  isSelected ? 'bg-primary/8' : 'hover:bg-muted/60'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>
                      {pipeline.name}
                    </span>
                    <Badge variant="secondary" className="text-xs h-4 px-1 shrink-0">
                      {pipeline.dealCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate">{pipeline.description}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatValue(pipeline.totalValue)}</span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
        <div className="border-t mt-1 pt-1">
          <button
            type="button"
            onClick={() => {
              onNewPipeline()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Pipeline
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
