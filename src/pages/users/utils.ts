import type { UserStatus, PermissionAction, AppModule, Role } from './typings'
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
  view:    { label: 'View',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  create:  { label: 'Create',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  edit:    { label: 'Edit',    className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  delete:  { label: 'Delete',  className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
  invite:  { label: 'Invite',  className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' },
  import:  { label: 'Import',  className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' },
  export:  { label: 'Export',  className: 'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' },
  assign:  { label: 'Assign',  className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300' },
  send:    { label: 'Send',    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' },
  billing: { label: 'Billing', className: 'bg-lime-100 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300' },
  use:     { label: 'Use',     className: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300' },
}

/**
 * The exact set of actions available per module, matching the API permission keys.
 * Only these actions are shown in the Permissions matrix for each module row.
 */
export const MODULE_ACTIONS: Record<AppModule, PermissionAction[]> = {
  users:         ['view', 'invite', 'edit', 'delete'],
  contacts:      ['view', 'create', 'edit', 'delete', 'import', 'export'],
  companies:     ['view', 'create', 'edit', 'delete'],
  leads:         ['view', 'create', 'edit', 'delete', 'assign', 'import', 'export'],
  pipeline:      ['view', 'create', 'edit', 'delete'],
  deals:         ['view', 'create', 'edit', 'delete'],
  tasks:         ['view', 'create', 'edit', 'delete'],
  calendar:      ['view', 'create', 'edit', 'delete'],
  communication: ['view', 'send'],
  marketing:     ['view', 'create', 'edit', 'delete', 'send'],
  reports:       ['view', 'export'],
  settings:      ['view', 'edit', 'billing'],
  ai:            ['use'],
}
