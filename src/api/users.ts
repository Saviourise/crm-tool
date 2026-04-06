import { api } from '@/lib/api'

export interface ApiUserObject {
  id: string
  email: string
  name: string | null
  job_title: string | null
  phone: string | null
  avatar_color: string | null
  initials: string | null
  timezone: string | null
  language: string | null
  is_active: boolean
  is_verified?: boolean
  created_at: string
}

export interface ApiRole {
  id: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]  // e.g. ["contacts.view", "leads.create"]
  color: string | null
  created_at: string
  member_count: number
}

export interface ApiWorkspaceMember {
  id: string
  user: ApiUserObject
  role: ApiRole
  status: string  // 'active' | 'invited' | 'deactivated'
  joined_at: string
  last_login: string | null
  is_active: boolean
}

export interface ApiInviteRequest {
  email: string
  role_id: string
}

export interface ApiUpdateMemberRequest {
  role_id?: string
  name?: string
  job_title?: string
  phone?: string
  avatar_color?: string
  timezone?: string
  language?: string
  status?: string  // deactivate/reactivate — see docs/users_remaining_endpoints.md
}

export interface ApiCreateRoleRequest {
  name: string
  description: string
  permissions?: string[]
  color?: string
}

export interface ApiUpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
  color?: string
}

export const usersApi = {
  list: () =>
    api.get<ApiWorkspaceMember[]>('/api/users/'),

  invite: (data: ApiInviteRequest) =>
    api.post<{ message: string; invite_id: string }>('/api/users/invite/', data),

  get: (id: string) =>
    api.get<ApiWorkspaceMember>(`/api/users/${id}/`),

  update: (id: string, data: ApiUpdateMemberRequest) =>
    api.patch<ApiWorkspaceMember>(`/api/users/${id}/`, data),

  remove: (id: string) =>
    api.delete<void>(`/api/users/${id}/`),

  resendInvite: (id: string) =>
    api.post<{ message: string }>(`/api/users/${id}/resend-invite/`),

  listRoles: () =>
    api.get<ApiRole[]>('/api/roles/'),

  createRole: (data: ApiCreateRoleRequest) =>
    api.post<ApiRole>('/api/roles/', data),

  updateRole: (id: string, data: ApiUpdateRoleRequest) =>
    api.put<ApiRole>(`/api/roles/${id}/`, data),

  deleteRole: (id: string) =>
    api.delete<void>(`/api/roles/${id}/`),
}
