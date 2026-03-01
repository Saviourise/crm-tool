import { Badge } from '@/components/ui/badge'
import type { RoleId } from '@/auth/types'

const ROLE_STYLES: Record<RoleId, string> = {
  'super-admin': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
  'admin':       'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  'manager':     'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  'sales-rep':   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  'marketing':   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
  'viewer':      'bg-muted text-muted-foreground border-border',
}

const ROLE_NAMES: Record<RoleId, string> = {
  'super-admin': 'Super Admin',
  'admin':       'Admin',
  'manager':     'Manager',
  'sales-rep':   'Sales Rep',
  'marketing':   'Marketing',
  'viewer':      'Viewer',
}

export function RoleBadge({ role }: { role: RoleId }) {
  return (
    <Badge variant="outline" className={`text-xs ${ROLE_STYLES[role]}`}>
      {ROLE_NAMES[role]}
    </Badge>
  )
}
