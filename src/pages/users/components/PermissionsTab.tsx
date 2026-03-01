import { useState, useEffect } from 'react'
import { Save, RotateCcw, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ACTION_CONFIG } from '../utils'
import type { Role, AppModule, PermissionAction, PermissionMatrix } from '../typings'
import { cn } from '@/lib/utils'

// ─── Module display names ──────────────────────────────────────────────────────

const MODULE_LABELS: Record<AppModule, string> = {
  dashboard:     'Dashboard',
  contacts:      'Contacts',
  leads:         'Leads',
  pipeline:      'Pipeline',
  tasks:         'Tasks',
  communication: 'Communication',
  marketing:     'Marketing',
  reports:       'Reports',
  settings:      'Settings',
  users:         'Users',
}

const MODULE_ORDER: AppModule[] = [
  'dashboard', 'contacts', 'leads', 'pipeline', 'tasks',
  'communication', 'marketing', 'reports', 'settings', 'users',
]

const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete']

// ─── Clone helper ──────────────────────────────────────────────────────────────

function clonePermissions(matrix: PermissionMatrix): PermissionMatrix {
  return Object.fromEntries(
    Object.entries(matrix).map(([mod, roles]) => [
      mod,
      Object.fromEntries(Object.entries(roles).map(([role, actions]) => [role, [...actions]])),
    ])
  ) as PermissionMatrix
}

// ─── Action toggle cell ────────────────────────────────────────────────────────

function ActionToggles({
  actions,
  onChange,
}: {
  actions: PermissionAction[]
  onChange: (next: PermissionAction[]) => void
}) {
  const toggle = (action: PermissionAction) => {
    const next = actions.includes(action)
      ? actions.filter((a) => a !== action)
      : ALL_ACTIONS.filter((a) => [...actions, action].includes(a))
    onChange(next)
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {ALL_ACTIONS.map((action) => {
        const active = actions.includes(action)
        const cfg = ACTION_CONFIG[action]
        return (
          <button
            key={action}
            type="button"
            onClick={() => toggle(action)}
            className={cn(
              'text-xs px-1.5 py-0.5 rounded border font-medium transition-all',
              active
                ? cn(cfg.className, 'border-transparent')
                : 'text-muted-foreground/40 border-muted-foreground/20 hover:border-muted-foreground/50 hover:text-muted-foreground'
            )}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PermissionsTab({
  roles,
  permissions,
  defaultPermissions,
  onSave,
}: {
  roles: Role[]
  permissions: PermissionMatrix
  defaultPermissions: PermissionMatrix
  onSave: (updated: PermissionMatrix) => void
}) {
  const [local, setLocal] = useState<PermissionMatrix>(() => clonePermissions(permissions))
  const [hasChanges, setHasChanges] = useState(false)

  // Sync if the saved permissions change (e.g. role added/deleted upstream)
  useEffect(() => {
    setLocal(clonePermissions(permissions))
    setHasChanges(false)
  }, [permissions])

  const handleChange = (module: AppModule, roleId: string, next: PermissionAction[]) => {
    setLocal((prev) => ({
      ...prev,
      [module]: { ...prev[module], [roleId]: next },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(local)
    toast.success('Permissions saved')
    setHasChanges(false)
  }

  const handleReset = () => {
    const reset = clonePermissions(defaultPermissions)
    setLocal(reset)
    onSave(reset)
    setHasChanges(false)
    toast.success('Permissions reset to defaults')
  }

  return (
    <div className="space-y-4">
      {/* Info + actions bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex-1">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Click any action to toggle it on or off per role and module. Save when done or reset to restore defaults.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Matrix table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">
                    Module
                  </th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-left px-4 py-3 min-w-[180px]">
                      <Badge variant="outline" className={cn('text-xs', role.color)}>
                        {role.name}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {MODULE_ORDER.map((module) => (
                  <tr key={module} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm text-muted-foreground">
                      {MODULE_LABELS[module]}
                    </td>
                    {roles.map((role) => (
                      <td key={role.id} className="px-4 py-3">
                        <ActionToggles
                          actions={local[module]?.[role.id] ?? []}
                          onChange={(next) => handleChange(module, role.id, next)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Legend:</span>
        {ALL_ACTIONS.map((action) => {
          const cfg = ACTION_CONFIG[action]
          return (
            <div key={action} className="flex items-center gap-1.5">
              <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium border-transparent', cfg.className)}>
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground">= active</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
