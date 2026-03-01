import type { UserStatus, PermissionAction, Role } from './typings'
import { MOCK_ROLES } from './data'

export function getRoleById(roleId: string, roles: Role[] = MOCK_ROLES) {
  return roles.find((r) => r.id === roleId)
}

export function getRoleName(roleId: string, roles: Role[] = MOCK_ROLES): string {
  return getRoleById(roleId, roles)?.name ?? roleId
}

export function getRoleBadgeClass(roleId: string, roles: Role[] = MOCK_ROLES): string {
  return getRoleById(roleId, roles)?.color ?? 'bg-muted text-muted-foreground border-border'
}

export function getStatusConfig(status: UserStatus) {
  const configs = {
    active: {
      label: 'Active',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    invited: {
      label: 'Invited',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    deactivated: {
      label: 'Deactivated',
      className: 'bg-muted text-muted-foreground border-border',
      dot: 'bg-muted-foreground/40',
    },
  }
  return configs[status]
}

export const ACTION_CONFIG: Record<PermissionAction, { label: string; className: string }> = {
  view:   { label: 'View',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  create: { label: 'Create', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  edit:   { label: 'Edit',   className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  delete: { label: 'Delete', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
}
