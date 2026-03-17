import { api } from '@/lib/api'

/** API contact - snake_case from backend */
export interface ApiContact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  company?: string | { id: string; name: string } | null
  position?: string | null
  status: string
  tags?: string[]
  avatar_url?: string | null
  linkedin?: string | null
  twitter?: string | null
  last_contacted?: string | null
  created_at: string
  updated_at?: string
  custom_fields?: Record<string, unknown>
}

export interface CursorPaginatedResponse<T> {
  results: T[]
  next: string | null
  previous: string | null
  count?: number
}

export interface ContactStatsResponse {
  total: number
  active: number
  prospects: number
  inactive: number
}

export interface ContactListParams {
  status?: string
  search?: string
  tag?: string
  company_id?: string
  limit?: number
  cursor?: string
  ordering?: string
}

export interface CreateContactRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status?: string
  tags?: string[]
  linkedin?: string
  custom_fields?: Record<string, unknown>
}

export interface UpdateContactRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  status?: string
  tags?: string[]
  linkedin?: string
  custom_fields?: Record<string, unknown>
}

export interface ImportStatusResponse {
  status: string
  imported?: number
  skipped?: number
  errors?: { row: number; reason: string }[]
}

export const contactsApi = {
  list: (params?: ContactListParams) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.search) search.set('search', params.search)
    if (params?.tag) search.set('tag', params.tag)
    if (params?.company_id) search.set('company_id', params.company_id)
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    if (params?.ordering) search.set('ordering', params.ordering)
    const qs = search.toString()
    return api.get<CursorPaginatedResponse<ApiContact>>(`/api/contacts/${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) => api.get<ApiContact>(`/api/contacts/${id}/`),

  create: (data: CreateContactRequest) => api.post<ApiContact>('/api/contacts/', data),

  update: (id: string, data: UpdateContactRequest) =>
    api.patch<ApiContact>(`/api/contacts/${id}/`, data),

  delete: (id: string) => api.delete(`/api/contacts/${id}/`),

  export: (params?: ContactListParams) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.search) search.set('search', params.search)
    if (params?.tag) search.set('tag', params.tag)
    if (params?.company_id) search.set('company_id', params.company_id)
    const qs = search.toString()
    return api.get<Blob>(`/api/contacts/export/${qs ? `?${qs}` : ''}`, {
      responseType: 'blob',
    })
  },

  import: (file: File, columnMap?: Record<string, string>) => {
    const form = new FormData()
    form.append('file', file)
    if (columnMap) {
      form.append('column_map', JSON.stringify(columnMap))
    }
    return api.post<{ task_id: string; status?: string; message?: string }>(
      '/api/contacts/import/',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  importStatus: (taskId: string) =>
    api.get<ImportStatusResponse>(`/api/contacts/import/${taskId}/status/`),

  activity: (id: string) =>
    api.get<{ results: Array<{ id: string; type: string; summary?: string; actor?: { id: string; name: string }; timestamp: string }> }>(
      `/api/contacts/${id}/activity/`
    ),

  stats: () => api.get<ContactStatsResponse>('/api/contacts/stats/'),
}
