import { api } from '@/lib/api'

export interface ApiCompany {
  id: string
  name: string
  industry?: string
  website?: string | null
  status?: string
  employees?: number | null
  annual_revenue?: number | null
  phone?: string | null
  address?: string | null
  contacts_count?: number
  deals_count?: number
  owner?: { id: string; name: string } | null
  created_at?: string
}

export interface CompaniesListResponse {
  results: ApiCompany[]
  count?: number
  next?: string | null
  previous?: string | null
}

export interface CompanyStatsResponse {
  total: number
  active: number
  inactive: number
  prospect: number
  open_deals?: number
  total_revenue?: number
}

export interface CreateCompanyRequest {
  name: string
  industry?: string
  website?: string
  status?: string
  employees?: number
  annual_revenue?: number
  phone?: string
  address?: string
}

export interface UpdateCompanyRequest {
  name?: string
  industry?: string
  website?: string
  status?: string
  employees?: number
  annual_revenue?: number
  phone?: string
  address?: string
}

export interface ImportStatusResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  result?: { imported?: number; skipped?: number; errors?: { row: number; reason: string }[] }
  error?: string
}

export const companiesApi = {
  list: (params?: { limit?: number; cursor?: string; search?: string; status?: string; industry?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    if (params?.search) search.set('search', params.search)
    if (params?.status) search.set('status', params.status)
    if (params?.industry) search.set('industry', params.industry)
    const qs = search.toString()
    return api.get<CompaniesListResponse>(`/api/companies/${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) => api.get<ApiCompany>(`/api/companies/${id}/`),

  create: (data: CreateCompanyRequest) => api.post<ApiCompany>('/api/companies/', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    api.patch<ApiCompany>(`/api/companies/${id}/`, data),

  delete: (id: string) => api.delete(`/api/companies/${id}/`),

  bulkDelete: (ids: string[]) =>
    api.post<{ deleted: number }>('/api/companies/bulk-delete/', { ids }),

  export: (params?: { search?: string; status?: string; industry?: string }) => {
    const search = new URLSearchParams()
    if (params?.search) search.set('search', params.search)
    if (params?.status) search.set('status', params.status)
    if (params?.industry) search.set('industry', params.industry)
    const qs = search.toString()
    return api.get<Blob>(`/api/companies/export/${qs ? `?${qs}` : ''}`, {
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
    >('/api/companies/import/', form)
  },

  importStatus: (taskId: string) =>
    api.get<ImportStatusResponse>(`/api/companies/import/${taskId}/status/`),

  stats: () => api.get<CompanyStatsResponse>('/api/companies/stats/'),

  /** Get company's contacts. See docs/API_INTEGRATION.md. */
  contacts: (id: string) =>
    api.get<{ results: import('@/api/contacts').ApiContact[] } | import('@/api/contacts').ApiContact[]>(
      `/api/companies/${id}/contacts/`
    ),

  deals: (id: string) =>
    api.get<Array<{ id: string; name: string; stage: string; value: string | number; expected_close_date?: string }>>(
      `/api/companies/${id}/deals/`
    ),
}
