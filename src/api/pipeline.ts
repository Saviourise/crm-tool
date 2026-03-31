import { api } from '@/lib/api'
import type { CursorPaginatedResponse } from './contacts'

export interface ApiDeal {
  id: string
  name: string
  pipeline: string | { id: string; name: string } | null
  company: string | { id: string; name: string } | null
  contact: string | { id: string; name: string } | null
  value: string
  stage: string
  probability: number
  expected_close_date: string | null
  assigned_to: string | { id: string; name: string } | null
  notes?: string | null
  custom_fields?: Record<string, unknown>
  stage_history?: Array<{
    from_stage: string
    to_stage: string
    changed_by: string
    changed_at: string
    notes?: string
  }>
  created_at: string
  updated_at?: string
}

export interface ApiPipeline {
  id: string
  name: string
  description: string
  is_default: boolean
  total_value?: string
  created_at: string
}

export interface ApiSavedView {
  id: string
  name: string
  entity_type: string
  filters: Record<string, unknown>
  columns?: string[]
  created_by: string
  created_at: string
}

export interface DealListParams {
  stage?: string
  pipeline?: string
  company?: string
  contact?: string
  assigned_to?: string
  min_value?: string
  max_value?: string
  close_date_from?: string
  close_date_to?: string
  min_probability?: number
  search?: string
  ordering?: string
  limit?: number
  cursor?: string
}

export interface CreateDealRequest {
  name: string
  pipeline?: string
  value?: string
  stage?: string
  probability?: number
  expected_close_date?: string
  notes?: string
  assigned_to?: string
}

export interface UpdateDealRequest {
  name?: string
  value?: string
  stage?: string
  probability?: number
  expected_close_date?: string
  notes?: string
  contact?: string | null
  company?: string | null
  assigned_to?: string | null
}

export interface CreatePipelineRequest {
  name: string
  description?: string
}

export interface CreateSavedViewRequest {
  name: string
  entity_type: 'deal'
  filters: Record<string, unknown>
  columns?: string[]
}

export interface LogDealActivityRequest {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  summary?: string
  duration_minutes?: number
  notes?: string
}

export interface ApiDealContact {
  role: string
  contact: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string | null
    position?: string | null
    avatar_url?: string | null
  }
}

export const pipelineApi = {
  // Pipelines
  listPipelines: () =>
    api.get<ApiPipeline[]>('/api/pipeline/pipelines/'),

  createPipeline: (data: CreatePipelineRequest) =>
    api.post<ApiPipeline>('/api/pipeline/pipelines/', data),

  updatePipeline: (id: string, data: Partial<CreatePipelineRequest>) =>
    api.patch<ApiPipeline>(`/api/pipeline/pipelines/${id}/`, data),

  deletePipeline: (id: string) =>
    api.delete(`/api/pipeline/pipelines/${id}/`),

  // Deals
  listDeals: (params?: DealListParams) => {
    const search = new URLSearchParams()
    if (params?.stage) search.set('stage', params.stage)
    if (params?.pipeline) search.set('pipeline', params.pipeline)
    if (params?.company) search.set('company', params.company)
    if (params?.contact) search.set('contact', params.contact)
    if (params?.assigned_to) search.set('assigned_to', params.assigned_to)
    if (params?.min_value) search.set('min_value', params.min_value)
    if (params?.max_value) search.set('max_value', params.max_value)
    if (params?.close_date_from) search.set('close_date_from', params.close_date_from)
    if (params?.close_date_to) search.set('close_date_to', params.close_date_to)
    if (params?.min_probability != null) search.set('min_probability', String(params.min_probability))
    if (params?.search) search.set('search', params.search)
    if (params?.ordering) search.set('ordering', params.ordering)
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<CursorPaginatedResponse<ApiDeal>>(`/api/pipeline/deals/${qs ? `?${qs}` : ''}`)
  },

  getDeal: (id: string) =>
    api.get<ApiDeal>(`/api/pipeline/deals/${id}/`),

  createDeal: (data: CreateDealRequest) =>
    api.post<ApiDeal>('/api/pipeline/deals/', data),

  updateDeal: (id: string, data: UpdateDealRequest) =>
    api.patch<ApiDeal>(`/api/pipeline/deals/${id}/`, data),

  deleteDeal: (id: string) =>
    api.delete(`/api/pipeline/deals/${id}/`),

  moveStage: (id: string, stage: string, notes?: string) =>
    api.patch<ApiDeal>(`/api/pipeline/deals/${id}/move-stage/`, { stage, ...(notes ? { notes } : {}) }),

  // Saved Views
  listSavedViews: () =>
    api.get<ApiSavedView[]>('/api/pipeline/deals/saved-views/?entity_type=deal'),

  createSavedView: (data: CreateSavedViewRequest) =>
    api.post<ApiSavedView>('/api/pipeline/deals/saved-views/', data),

  deleteSavedView: (id: string) =>
    api.delete(`/api/pipeline/saved-views/${id}/`),

  // Deal sub-resources
  logActivity: (id: string, data: LogDealActivityRequest) =>
    api.post(`/api/pipeline/deals/${id}/activity/`, data),

  dealContacts: (id: string) =>
    api.get<{ results: ApiDealContact[] }>(`/api/pipeline/deals/${id}/contacts/`),
}
