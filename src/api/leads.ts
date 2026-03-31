import { api } from '@/lib/api'

export interface ApiLead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  company?: string | { id: string; name: string } | null
  position?: string | null
  status: string
  source: string
  score: number
  value?: string | null
  assigned_to?: { id: string; name: string } | null
  notes?: string | null
  last_activity?: string | null
  created_by?: string | null
  custom_fields?: Record<string, unknown>
  created_at: string
  updated_at?: string
}

export interface LeadListParams {
  status?: string
  source?: string
  assigned_to?: string
  search?: string
  ordering?: string
  limit?: number
  cursor?: string
}

export interface CursorPaginatedLeadsResponse {
  results: ApiLead[]
  next: string | null
  previous: string | null
  count?: number
}

export interface CreateLeadRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status?: string
  source?: string
  score?: number
  value?: string
  assigned_to?: string
  notes?: string
}

export interface UpdateLeadRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  status?: string
  source?: string
  score?: number
  value?: string
  assigned_to?: string
  notes?: string
}

export interface ConvertLeadRequest {
  create_deal?: boolean
  deal_name?: string
  deal_value?: string
  pipeline_id?: string
}

export interface ConvertLeadResponse {
  message: string
  contact_id: string
  deal_id?: string
}

export interface LeadStatsResponse {
  total: number
  new: number
  contacted: number
  qualified: number
  unqualified: number
  converted: number
  lost: number
  avg_score: number
}

export interface LeadActivityEntry {
  id: string
  type: string
  summary?: string
  actor?: { id: string; name: string }
  timestamp: string
}

export interface LogLeadActivityRequest {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  summary?: string
  duration_minutes?: number
  notes?: string
}

export interface LeadImportStatusResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  result?: { imported?: number; skipped?: number; errors?: { row: number; reason: string }[] }
  error?: string
}

export const leadsApi = {
  list: (params?: LeadListParams) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.source) search.set('source', params.source)
    if (params?.assigned_to) search.set('assigned_to', params.assigned_to)
    if (params?.search) search.set('search', params.search)
    if (params?.ordering) search.set('ordering', params.ordering)
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<CursorPaginatedLeadsResponse>(`/api/leads/${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) => api.get<ApiLead>(`/api/leads/${id}/`),

  create: (data: CreateLeadRequest) => api.post<ApiLead>('/api/leads/', data),

  update: (id: string, data: UpdateLeadRequest) =>
    api.patch<ApiLead>(`/api/leads/${id}/`, data),

  delete: (id: string) => api.delete(`/api/leads/${id}/`),

  convert: (id: string, data?: ConvertLeadRequest) =>
    api.post<ConvertLeadResponse>(`/api/leads/${id}/convert/`, data ?? {}),

  export: (params?: Pick<LeadListParams, 'status' | 'source' | 'search'>) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.source) search.set('source', params.source)
    if (params?.search) search.set('search', params.search)
    const qs = search.toString()
    return api.get<Blob>(`/api/leads/export/${qs ? `?${qs}` : ''}`, {
      responseType: 'blob',
    })
  },

  import: (file: File, columnMap?: Record<string, string>) => {
    const form = new FormData()
    form.append('file', file)
    if (columnMap) {
      form.append('column_map', JSON.stringify(columnMap))
    }
    return api.post<
      | { task_id: string; status?: string; message?: string }
      | { created: number; errors: Array<{ row?: number; reason?: string }> }
    >('/api/leads/import/', form)
  },

  importStatus: (taskId: string) =>
    api.get<LeadImportStatusResponse>(`/api/leads/import/${taskId}/status/`),

  stats: () => api.get<LeadStatsResponse>('/api/leads/stats/'),

  activity: (id: string) =>
    api.get<{ results: LeadActivityEntry[] }>(`/api/leads/${id}/activity/`),

  logActivity: (id: string, data: LogLeadActivityRequest) =>
    api.post(`/api/leads/${id}/activity/`, data),

  bulkDelete: (ids: string[]) =>
    api.post<{ deleted: number }>('/api/leads/bulk-delete/', { ids }),
}
