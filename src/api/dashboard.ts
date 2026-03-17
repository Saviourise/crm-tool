import { api } from '@/lib/api'

/** Sales performance from GET /api/reports/sales-performance/ */
export interface SalesPerformanceResponse {
  total_deals: number
  total_value: string
  won_deals: number
  won_value: string
  win_rate: number
  avg_deal_value: string
  by_stage: Record<string, number>
}

/** Lead analytics from GET /api/reports/lead-analytics/ */
export interface LeadStatusItem {
  status: string
  count: number
}
export interface LeadSourceItem {
  source: string
  count: number
}
export interface LeadAnalyticsResponse {
  total_leads: number
  avg_score: number
  /** API returns array of { status, count }; we normalize to chart format */
  by_status: Record<string, number> | LeadStatusItem[]
  by_source: Record<string, number> | LeadSourceItem[]
}

/** Revenue forecast from GET /api/reports/revenue-forecast/ */
export interface RevenueForecastItem {
  month: string
  committed: string
  upside: string
  total_forecast: string
}

export interface RevenueForecastResponse {
  forecast: RevenueForecastItem[]
}

/** Activity from GET /api/activity/ */
export interface ApiActivity {
  id: string
  type: string
  entity_type: string
  entity_id: string
  notes: string | null
  duration_minutes: number | null
  actor: string
  logged_at: string
}

/** Cursor-paginated response */
export interface CursorPaginatedResponse<T> {
  results: T[]
  next: string | null
  previous: string | null
}

/** Contact list item (minimal for count) */
export interface ApiContact {
  id: string
  [key: string]: unknown
}

/** Task list item (minimal for count) */
export interface ApiTask {
  id: string
  status: string
  due_date: string | null
  [key: string]: unknown
}

export const dashboardApi = {
  salesPerformance: (period: '7d' | '30d' | '90d' | '1y' = '30d') =>
    api.get<SalesPerformanceResponse>(`/api/reports/sales-performance/?period=${period}`),

  leadAnalytics: (period: '7d' | '30d' | '90d' | '1y' = '30d') =>
    api.get<LeadAnalyticsResponse>(`/api/reports/lead-analytics/?period=${period}`),

  revenueForecast: () =>
    api.get<RevenueForecastResponse>('/api/reports/revenue-forecast/'),

  activity: (params?: { entity_type?: string; entity_id?: string; actor?: string; type?: string; page_size?: number }) => {
    const search = new URLSearchParams()
    if (params?.entity_type) search.set('entity_type', params.entity_type)
    if (params?.entity_id) search.set('entity_id', params.entity_id)
    if (params?.actor) search.set('actor', params.actor)
    if (params?.type) search.set('type', params.type)
    if (params?.page_size) search.set('page_size', String(params.page_size))
    const qs = search.toString()
    return api.get<CursorPaginatedResponse<ApiActivity>>(`/api/activity/${qs ? `?${qs}` : ''}`)
  },

  /** List contacts (paginated) - use for count with page_size */
  contacts: (params?: { page_size?: number; cursor?: string }) => {
    const search = new URLSearchParams()
    if (params?.page_size) search.set('page_size', String(params.page_size))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<CursorPaginatedResponse<ApiContact>>(`/api/contacts/${qs ? `?${qs}` : ''}`)
  },

  /** List tasks (paginated) - use for count with page_size and status filter */
  tasks: (params?: { status?: string; page_size?: number; cursor?: string }) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.page_size) search.set('page_size', String(params.page_size))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<CursorPaginatedResponse<ApiTask>>(`/api/tasks/${qs ? `?${qs}` : ''}`)
  },
}
