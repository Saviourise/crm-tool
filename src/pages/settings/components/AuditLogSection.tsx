import { useState, useMemo, Fragment } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { MOCK_AUDIT_LOG } from '../data'
import type { AuditEntry, AuditAction } from '../typings'

// ─── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(entries: AuditEntry[]) {
  const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity Name', 'IP', 'Details']
  const rows = entries.map((e) => [
    e.timestamp, e.user, e.action, e.entityType, e.entityName, e.ip, e.details,
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'audit-log.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Action badge ──────────────────────────────────────────────────────────────

const ACTION_CLASSES: Record<AuditAction, string> = {
  created:          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  updated:          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  deleted:          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  login:            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  export:           'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
  'settings-change':'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800',
}

const ACTION_LABELS: Record<AuditAction, string> = {
  created:          'Created',
  updated:          'Updated',
  deleted:          'Deleted',
  login:            'Login',
  export:           'Export',
  'settings-change':'Settings',
}

const ALL_ACTIONS: AuditAction[] = ['created', 'updated', 'deleted', 'login', 'export', 'settings-change']

const PAGE_SIZE = 10

// ─── Filters ───────────────────────────────────────────────────────────────────

interface Filters {
  dateFrom:   string
  dateTo:     string
  user:       string
  actionType: string
  entityType: string
}

const EMPTY_FILTERS: Filters = {
  dateFrom:   '',
  dateTo:     '',
  user:       '',
  actionType: '',
  entityType: '',
}

function filtersActive(f: Filters): boolean {
  return Object.values(f).some((v) => v !== '')
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AuditLogSection() {
  const [filters, setFilters]       = useState<Filters>(EMPTY_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const setFilter = (key: keyof Filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // Unique values for filter options
  const uniqueUsers       = useMemo(() => [...new Set(MOCK_AUDIT_LOG.map((e) => e.user))].sort(), [])
  const uniqueEntityTypes = useMemo(() => [...new Set(MOCK_AUDIT_LOG.map((e) => e.entityType))].sort(), [])

  // Filter entries
  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOG.filter((entry) => {
      if (filters.dateFrom && entry.timestamp.slice(0, 10) < filters.dateFrom) return false
      if (filters.dateTo   && entry.timestamp.slice(0, 10) > filters.dateTo)   return false
      if (filters.user       && entry.user !== filters.user)                   return false
      if (filters.actionType && entry.action !== filters.actionType)            return false
      if (filters.entityType && entry.entityType !== filters.entityType)        return false
      return true
    })
  }, [filters])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(currentPage, totalPages)
  const pageEntries = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const startIdx    = (safePage - 1) * PAGE_SIZE + 1
  const endIdx      = Math.min(safePage * PAGE_SIZE, filtered.length)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>Audit Log</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCSV(filtered)}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export Log
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter('dateFrom')(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter('dateTo')(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">User</label>
              <Select value={filters.user || '__all__'} onValueChange={(v) => setFilter('user')(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Users</SelectItem>
                  {uniqueUsers.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Action</label>
              <Select value={filters.actionType || '__all__'} onValueChange={(v) => setFilter('actionType')(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Actions</SelectItem>
                  {ALL_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{ACTION_LABELS[a]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Entity</label>
              <Select value={filters.entityType || '__all__'} onValueChange={(v) => setFilter('entityType')(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Entities</SelectItem>
                  {uniqueEntityTypes.map((et) => (
                    <SelectItem key={et} value={et}>{et}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filtersActive(filters) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-9"
                onClick={() => { setFilters(EMPTY_FILTERS); setCurrentPage(1) }}
              >
                Reset Filters
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Entity</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">IP</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {pageEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      No entries match the current filters.
                    </td>
                  </tr>
                )}
                {pageEntries.map((entry) => {
                  const expanded = expandedId === entry.id
                  return (
                    <Fragment key={entry.id}>
                      <tr
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground font-mono">{entry.timestamp}</span>
                        </td>

                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              {entry.userInitials}
                            </div>
                            <span className="text-sm truncate">{entry.user}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium',
                            ACTION_CLASSES[entry.action]
                          )}>
                            {ACTION_LABELS[entry.action]}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{entry.entityType}</span>
                          <p className="text-sm font-medium truncate max-w-[140px]">{entry.entityName}</p>
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-muted-foreground">{entry.ip}</span>
                        </td>

                        {/* Details + expand */}
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-1">
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {entry.details}
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedId(expanded ? null : entry.id)}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {expanded
                                ? <ChevronUp className="h-3.5 w-3.5" />
                                : <ChevronDown className="h-3.5 w-3.5" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded details row */}
                      {expanded && (
                        <tr className="bg-muted/20 border-b last:border-0">
                          <td colSpan={6} className="px-4 py-2.5">
                            <p className="text-xs text-muted-foreground">{entry.details}</p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length === 0
                ? 'No entries'
                : `Showing ${startIdx}–${endIdx} of ${filtered.length} entries`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {safePage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
