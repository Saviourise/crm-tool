export type Role = 'owner' | 'admin' | 'manager' | 'sales' | 'support' | 'user'

export type Permission =
  | 'read:contacts'
  | 'write:contacts'
  | 'read:leads'
  | 'write:leads'
  | 'read:opportunities'
  | 'write:opportunities'
  | 'read:tasks'
  | 'write:tasks'
  | 'read:campaigns'
  | 'write:campaigns'
  | 'read:reports'
  | 'admin:settings'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: Role
  permissions: Permission[]
  createdAt: Date
  lastLogin: Date
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

export interface FilterOption {
  label: string
  value: string
}

export interface DateRange {
  start: Date
  end: Date
}
