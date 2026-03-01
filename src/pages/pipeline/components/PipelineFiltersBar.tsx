import { useState } from 'react'
import { Filter, X, ChevronDown, Bookmark, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PipelineFilters, SavedView } from '../typings'

const TEAM_MEMBERS = ['Sarah K.', 'James R.', 'Alex M.', 'Priya T.']

interface PipelineFiltersBarProps {
  filters: PipelineFilters
  onFiltersChange: (f: PipelineFilters) => void
  savedViews: SavedView[]
  onSaveView: (name: string) => void
  onLoadView: (view: SavedView) => void
}

function countActiveFilters(filters: PipelineFilters): number {
  let count = 0
  if (filters.assignees.length > 0) count++
  if (filters.minValue) count++
  if (filters.maxValue) count++
  if (filters.closeDateFrom) count++
  if (filters.closeDateTo) count++
  if (filters.minProbability > 0) count++
  return count
}

export function PipelineFiltersBar({
  filters,
  onFiltersChange,
  savedViews,
  onSaveView,
  onLoadView,
}: PipelineFiltersBarProps) {
  const [open, setOpen] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [savingView, setSavingView] = useState(false)
  const [newViewName, setNewViewName] = useState('')

  const activeCount = countActiveFilters(filters)

  const toggleAssignee = (member: string) => {
    const next = filters.assignees.includes(member)
      ? filters.assignees.filter((a) => a !== member)
      : [...filters.assignees, member]
    onFiltersChange({ ...filters, assignees: next })
  }

  const clearAll = () => {
    onFiltersChange({ assignees: [], minValue: '', maxValue: '', closeDateFrom: '', closeDateTo: '', minProbability: 0 })
  }

  const handleSaveView = () => {
    if (!newViewName.trim()) return
    onSaveView(newViewName.trim())
    setNewViewName('')
    setSavingView(false)
    setViewsOpen(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 h-9"
        onClick={() => setOpen(!open)}
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <Badge className="h-4 px-1.5 text-xs ml-0.5 bg-primary text-primary-foreground">
            {activeCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          {/* Assignee multi-select */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => {
                setAssigneeOpen(!assigneeOpen)
                setViewsOpen(false)
              }}
            >
              Assignee
              {filters.assignees.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-xs ml-0.5">
                  {filters.assignees.length}
                </Badge>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {assigneeOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-popover border rounded-md shadow-md z-20 p-1">
                {TEAM_MEMBERS.map((member) => {
                  const checked = filters.assignees.includes(member)
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() => toggleAssignee(member)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors"
                    >
                      <div className={cn(
                        'h-4 w-4 rounded border flex items-center justify-center shrink-0',
                        checked ? 'bg-primary border-primary' : 'border-border'
                      )}>
                        {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      {member}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Min Value */}
          <Input
            type="number"
            placeholder="Min $"
            value={filters.minValue}
            onChange={(e) => onFiltersChange({ ...filters, minValue: e.target.value })}
            className="h-9 w-28 text-sm"
          />

          {/* Max Value */}
          <Input
            type="number"
            placeholder="Max $"
            value={filters.maxValue}
            onChange={(e) => onFiltersChange({ ...filters, maxValue: e.target.value })}
            className="h-9 w-28 text-sm"
          />

          {/* Close Date From */}
          <Input
            type="date"
            value={filters.closeDateFrom}
            onChange={(e) => onFiltersChange({ ...filters, closeDateFrom: e.target.value })}
            className="h-9 w-40 text-sm"
            title="Close date from"
          />

          {/* Close Date To */}
          <Input
            type="date"
            value={filters.closeDateTo}
            onChange={(e) => onFiltersChange({ ...filters, closeDateTo: e.target.value })}
            className="h-9 w-40 text-sm"
            title="Close date to"
          />

          {/* Min Probability */}
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Min %"
            value={filters.minProbability > 0 ? String(filters.minProbability) : ''}
            onChange={(e) => onFiltersChange({ ...filters, minProbability: e.target.value ? Number(e.target.value) : 0 })}
            className="h-9 w-24 text-sm"
          />

          {/* Clear All */}
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-muted-foreground" onClick={clearAll}>
              <X className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </>
      )}

      {/* Saved Views — always visible */}
      <div className="relative ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-9"
          onClick={() => {
            setViewsOpen(!viewsOpen)
            setAssigneeOpen(false)
          }}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Saved Views
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        {viewsOpen && (
          <div className="absolute top-full right-0 mt-1 w-52 bg-popover border rounded-md shadow-md z-20 p-1">
            {savedViews.length > 0 && (
              <>
                {savedViews.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => {
                      onLoadView(view)
                      setViewsOpen(false)
                      setOpen(true)
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors text-left"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {view.name}
                  </button>
                ))}
                <div className="border-t my-1" />
              </>
            )}
            {savingView ? (
              <div className="px-2 py-1.5 space-y-1.5">
                <Input
                  autoFocus
                  placeholder="View name..."
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveView() }}
                  className="h-7 text-xs"
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-6 text-xs flex-1" onClick={handleSaveView}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setSavingView(false); setNewViewName('') }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSavingView(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Save Current View
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
