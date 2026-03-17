import { api } from '@/lib/api'

export interface ApiCompany {
  id: string
  name: string
  industry?: string
  website?: string | null
  created_at?: string
}

export interface CompaniesListResponse {
  results: ApiCompany[]
  count?: number
  next?: string | null
  previous?: string | null
}

export const companiesApi = {
  list: (params?: { limit?: number; search?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.search) search.set('search', params.search)
    const qs = search.toString()
    return api.get<CompaniesListResponse>(`/api/companies/${qs ? `?${qs}` : ''}`)
  },
}
