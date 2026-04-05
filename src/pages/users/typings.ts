export type UserStatus = 'active' | 'invited' | 'deactivated'

export type PermissionAction =
  | 'view' | 'create' | 'edit' | 'delete'   // standard CRUD
  | 'invite'                                  // users
  | 'import' | 'export'                       // contacts, leads
  | 'assign'                                  // leads
  | 'send'                                    // communication, marketing
  | 'billing'                                 // settings
  | 'use'                                     // ai

export type AppModule =
  | 'users'
  | 'contacts'
  | 'companies'
  | 'leads'
  | 'pipeline'
  | 'deals'
  | 'tasks'
  | 'calendar'
  | 'communication'
  | 'marketing'
  | 'reports'
  | 'settings'
  | 'ai'

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
