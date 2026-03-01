export type UserStatus = 'active' | 'invited' | 'deactivated'
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'
export type AppModule =
  | 'dashboard'
  | 'contacts'
  | 'leads'
  | 'pipeline'
  | 'tasks'
  | 'communication'
  | 'marketing'
  | 'reports'
  | 'settings'
  | 'users'

export interface AppUser {
  id: string
  name: string
  initials: string
  avatarColor: string
  email: string
  roleId: string
  status: UserStatus
  lastLogin?: string
  joinedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
  color: string
  borderColor: string
  userCount: number
}

export type PermissionMatrix = Record<AppModule, Record<string, PermissionAction[]>>
