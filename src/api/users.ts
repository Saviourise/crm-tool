import { api } from '@/lib/api'

export interface ApiUserObject {
  id: string
  email: string
  name: string
  job_title: string
  timezone: string
  is_active: boolean
  created_at: string
}

export interface ApiWorkspaceMember {
  id: string
  user: ApiUserObject
  role: {
    id: string
    name: string
    description: string
    is_system: boolean
    permissions: string[]
    color: string | null
    created_at: string
    member_count: number
  }
  status: string
  joined_at: string
  last_login: string | null
  is_active: boolean
}

export const usersApi = {
  list: () => api.get<ApiWorkspaceMember[]>('/api/users/'),
}
