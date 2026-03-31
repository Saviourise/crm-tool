import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Filter, X, ChevronDown, Bookmark, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/common/DatePicker'
import { useWorkspaceUsers } from '@/hooks/useWorkspaceUsers'
import type { PipelineFilters, SavedView } from '../typings'

interface PipelineFiltersBarProps {
  filters: PipelineFilters
  onFiltersChange: (f: PipelineFilters) => void
  savedViews: SavedView[]
  savedViewsLoading?: boolean
  onSaveView: (name: string) => void
  onLoadView: (view: SavedView) => void
}

const EMPTY_FILTERS: PipelineFilters = {
  assignedTo: '',
  minValue: '',
  maxValue: '',
  closeDateFrom: '',
  closeDateTo: '',
  minProbability: 0,
}

function countActiveFilters(filters: PipelineFilters): number {
  let count = 0
  if (filters.assignedTo) count++
  if (filters.minValue) count++
  if (filters.maxValue) count++
  if (filters.closeDateFrom) count++
  if (filters.closeDateTo) count++
  if (filters.minProbability > 0) count++
  return count
}

function toDate(iso: string): Date | undefined {
  if (!iso) return undefined
  try { return parseISO(iso) } catch { return undefined }
}

function fromDate(d: Date | undefined): string {
  return d ? format(d, 'yyyy-MM-dd') : ''
}

export function PipelineFiltersBar({
  filters,
  onFiltersChange,
  savedViews,
  savedViewsLoading,
  onSaveView,
  onLoadView,
}: PipelineFiltersBarProps) {
  const { users } = useWorkspaceUsers()
  const [open, setOpen] = useState(false)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [savingView, setSavingView] = useState(false)
  const [newViewName, setNewViewName] = useState('')

  const [pending, setPending] = useState<PipelineFilters>(filters)

  useEffect(() => {
    setPending(filters)
  }, [filters])

  const appliedCount = countActiveFilters(filters)
  const isDirty = JSON.stringify(pending) !== JSON.stringify(filters)

  const handleApply = () => onFiltersChange(pending)

  const handleClearAll = () => {
    setPending(EMPTY_FILTERS)
    onFiltersChange(EMPTY_FILTERS)
  }

  const handleSaveView = () => {
    if (!newViewName.trim()) return
    onSaveView(newViewName.trim())
    setNewViewName('')
    setSavingView(false)
    setViewsOpen(false)
  }

  return (
    <div className="space-y-2">
      {/* Always-visible row: toggle + saved views */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-9"
          onClick={() => setOpen(!open)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {appliedCount > 0 && (
            <Badge className="h-4 px-1.5 text-xs ml-0.5 bg-primary text-primary-foreground">
              {appliedCount}
            </Badge>
          )}
        </Button>

        <div className="relative ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9"
            disabled={savedViewsLoading}
            onClick={() => setViewsOpen(!viewsOpen)}
          >
            {savedViewsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
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

      {/* Expanded filter row */}
      {open && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30">
          <Select
            value={pending.assignedTo || 'all'}
            onValueChange={(v) => setPending((p) => ({ ...p, assignedTo: v === 'all' ? '' : v }))}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min value ($)"
            value={pending.minValue}
            onChange={(e) => setPending((p) => ({ ...p, minValue: e.target.value }))}
            className="h-9 w-[130px] text-sm"
          />

          <Input
            type="number"
            placeholder="Max value ($)"
            value={pending.maxValue}
            onChange={(e) => setPending((p) => ({ ...p, maxValue: e.target.value }))}
            className="h-9 w-[130px] text-sm"
          />

          <DatePicker
            value={toDate(pending.closeDateFrom)}
            onChange={(d) => setPending((p) => ({ ...p, closeDateFrom: fromDate(d) }))}
            placeholder="Close date from"
            className="h-9 w-[155px] text-sm"
          />

          <DatePicker
            value={toDate(pending.closeDateTo)}
            onChange={(d) => setPending((p) => ({ ...p, closeDateTo: fromDate(d) }))}
            placeholder="Close date to"
            className="h-9 w-[148px] text-sm"
          />

          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Min prob. (%)"
            value={pending.minProbability > 0 ? String(pending.minProbability) : ''}
            onChange={(e) => setPending((p) => ({ ...p, minProbability: e.target.value ? Number(e.target.value) : 0 }))}
            className="h-9 w-[120px] text-sm"
          />

          <div className="flex items-center gap-2 ml-auto">
            {appliedCount > 0 && (
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={handleClearAll}>
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            <Button size="sm" className="h-9 px-5" onClick={handleApply} disabled={!isDirty}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
