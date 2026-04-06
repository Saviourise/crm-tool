import type { ApiUser, ApiWorkspace, ApiRole } from '@/api/types'
import type { AuthUser, RoleId, PlanId } from './types'

const ROLE_NAME_MAP: Record<string, RoleId> = {
  'super-admin': 'super-admin',
  admin: 'admin',
  manager: 'manager',
  'sales-rep': 'sales-rep',
  marketing: 'marketing',
  viewer: 'viewer',
}

function deriveInitials(name: string | null, email: string): string {
  const src = name?.trim() || email
  return src.split(/\s+/).map((p) => p[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || '?'
}

export function mapApiUserToAuthUser(
  apiUser: ApiUser,
  roleName: string,
  plan: PlanId,
  workspaceName: string
): AuthUser {
  const role = ROLE_NAME_MAP[roleName] ?? 'viewer'
  const name = apiUser.name ?? apiUser.email
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    role,
    plan,
    company: workspaceName,
    avatarColor: apiUser.avatar_color ?? '#3b82f6',
    initials: apiUser.initials ?? deriveInitials(apiUser.name, apiUser.email),
    jobTitle: apiUser.job_title ?? '',
    isVerified: apiUser.is_verified ?? true,
    phone: apiUser.phone ?? undefined,
    timezone: apiUser.timezone ?? undefined,
    language: apiUser.language ?? undefined,
    avatarUrl: apiUser.avatar_url ?? undefined,
  }
}

export function getPlanFromWorkspace(workspace: ApiWorkspace): PlanId {
  return workspace.plan
}

export function getRoleNameFromRole(role: ApiRole): string {
  return role.name
}

/** Map API user for signup/onboarding when workspace/role not yet available */
export function mapApiUserToAuthUserMinimal(apiUser: ApiUser): AuthUser {
  const name = apiUser.name ?? apiUser.email
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    role: 'super-admin',
    plan: 'free',
    company: '',
    avatarColor: apiUser.avatar_color ?? '#3b82f6',
    initials: apiUser.initials ?? deriveInitials(apiUser.name, apiUser.email),
    jobTitle: apiUser.job_title ?? '',
    isVerified: apiUser.is_verified ?? true,
    phone: apiUser.phone ?? undefined,
    timezone: apiUser.timezone ?? undefined,
    language: apiUser.language ?? undefined,
    avatarUrl: apiUser.avatar_url ?? undefined,
  }
}
