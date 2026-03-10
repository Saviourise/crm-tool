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

export function mapApiUserToAuthUser(
  apiUser: ApiUser,
  roleName: string,
  plan: PlanId,
  workspaceName: string
): AuthUser {
  const role = ROLE_NAME_MAP[roleName] ?? 'viewer'
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role,
    plan,
    company: workspaceName,
    avatarColor: apiUser.avatar_color ?? '#6366f1',
    initials: apiUser.initials ?? apiUser.name.slice(0, 2).toUpperCase(),
    jobTitle: apiUser.job_title ?? '',
    isVerified: apiUser.is_verified ?? true,
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
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: 'super-admin',
    plan: 'free',
    company: '',
    avatarColor: apiUser.avatar_color ?? '#6366f1',
    initials: apiUser.initials ?? apiUser.name.slice(0, 2).toUpperCase(),
    jobTitle: apiUser.job_title ?? '',
    isVerified: apiUser.is_verified ?? true,
  }
}
