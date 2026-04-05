import { formatDistanceToNow } from 'date-fns'
import type { ApiWorkspaceMember, ApiRole } from '@/api/users'
import type { AppUser, Role, PermissionMatrix, AppModule, PermissionAction } from './typings'

// ─── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
  'bg-teal-500', 'bg-indigo-500',
]

function deriveAvatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function deriveInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatLastLogin(value: string | null): string | undefined {
  if (!value) return undefined
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return undefined
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return undefined
  }
}

function formatJoinedAt(value: string): string {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return value
  }
}

// ─── Role color mapping ────────────────────────────────────────────────────────

const SYSTEM_ROLE_COLORS: Record<string, { color: string; borderColor: string }> = {
  'super-admin': {
    color:       'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    borderColor: 'border-l-rose-500',
  },
  admin: {
    color:       'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    borderColor: 'border-l-rose-500',
  },
  manager: {
    color:       'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    borderColor: 'border-l-amber-500',
  },
  'sales-rep': {
    color:       'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    borderColor: 'border-l-blue-500',
  },
  marketing: {
    color:       'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
    borderColor: 'border-l-violet-500',
  },
  support: {
    color:       'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800',
    borderColor: 'border-l-cyan-500',
  },
  viewer: {
    color:       'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800',
    borderColor: 'border-l-slate-500',
  },
}

const CUSTOM_ROLE_COLORS = [
  { color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800',       borderColor: 'border-l-teal-500'   },
  { color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800', borderColor: 'border-l-indigo-500' },
  { color: 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/50 dark:text-lime-400 dark:border-lime-800',         borderColor: 'border-l-lime-500'   },
  { color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800',               borderColor: 'border-l-sky-500'    },
  { color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800', borderColor: 'border-l-orange-500' },
  { color: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800',         borderColor: 'border-l-pink-500'   },
]

function deriveRoleColors(apiRole: ApiRole, customIndex: number) {
  if (apiRole.is_system) {
    const slug = apiRole.name.toLowerCase().replace(/\s+/g, '-')
    return SYSTEM_ROLE_COLORS[slug]
      ?? SYSTEM_ROLE_COLORS[apiRole.id]
      ?? { color: 'bg-muted text-muted-foreground border-border', borderColor: 'border-l-muted-foreground/30' }
  }
  return CUSTOM_ROLE_COLORS[customIndex % CUSTOM_ROLE_COLORS.length]
}

// ─── Public mappers ────────────────────────────────────────────────────────────

export function mapApiRoleToRole(apiRole: ApiRole, customIndex = 0): Role {
  const colors = deriveRoleColors(apiRole, customIndex)
  return {
    id:          apiRole.id,
    name:        apiRole.name,
    description: apiRole.description,
    isSystem:    apiRole.is_system,
    color:       colors.color,
    borderColor: colors.borderColor,
    userCount:   apiRole.member_count,
  }
}

export function mapApiMemberToUser(member: ApiWorkspaceMember): AppUser {
  const name = member.user.name
  const status = (member.status as AppUser['status'])
    ?? (member.is_active ? 'active' : 'deactivated')
  return {
    id:          member.id,
    name,
    initials:    deriveInitials(name),
    avatarColor: deriveAvatarColor(member.user.id),
    email:       member.user.email,
    roleId:      member.role.id,
    status,
    lastLogin:   formatLastLogin(member.last_login),
    joinedAt:    formatJoinedAt(member.joined_at),
  }
}

// ─── Permissions ───────────────────────────────────────────────────────────────

const ALL_MODULES: AppModule[] = [
  'dashboard', 'contacts', 'leads', 'pipeline', 'tasks',
  'communication', 'marketing', 'reports', 'settings', 'users',
]

const VALID_ACTIONS = new Set<PermissionAction>(['view', 'create', 'edit', 'delete'])

/**
 * Build a PermissionMatrix from the permissions arrays of all API roles.
 * Each role's `permissions` is ["contacts.view", "leads.create", ...].
 */
export function buildPermissionMatrix(apiRoles: ApiRole[]): PermissionMatrix {
  const matrix: PermissionMatrix = {} as PermissionMatrix

  for (const mod of ALL_MODULES) {
    matrix[mod] = {}
    for (const role of apiRoles) {
      matrix[mod][role.id] = role.permissions
        .filter((p) => p.startsWith(`${mod}.`))
        .map((p) => p.slice(mod.length + 1))
        .filter((a): a is PermissionAction => VALID_ACTIONS.has(a as PermissionAction))
    }
  }

  return matrix
}

/**
 * Convert a PermissionMatrix column for a given roleId back to a flat
 * permissions array suitable for the API: ["contacts.view", "leads.create", ...]
 */
export function matrixColumnToPermissions(matrix: PermissionMatrix, roleId: string): string[] {
  const result: string[] = []
  for (const mod of ALL_MODULES) {
    for (const action of (matrix[mod]?.[roleId] ?? [])) {
      result.push(`${mod}.${action}`)
    }
  }
  return result
}
