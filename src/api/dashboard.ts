import { api } from '@/lib/api'

/** One row in `stage_distribution` from GET /api/reports/sales-performance/ */
export interface SalesStageDistributionItem {
  stage: string
  count: number
  value: number
}

/** Sales performance from GET /api/reports/sales-performance/ */
export interface SalesPerformanceResponse {
  period_days: number
  total_deals: number
  total_value: number
  won_deals: number
  lost_deals: number
  win_rate: number
  stage_distribution: SalesStageDistributionItem[]
}

/** Total currency in closed-won stages (API puts won deal value on `won` rows). */
export function getClosedWonValue(sales: SalesPerformanceResponse): number {
  return sales.stage_distribution.reduce((sum, row) => {
    if (row.stage.toLowerCase() !== 'won') return sum
    return sum + (Number(row.value) || 0)
  }, 0)
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
  stage: string
  month: string
  total: number
  count: number
}

export interface RevenueForecastResponse {
  forecast: RevenueForecastItem[]
}

/** Activity from GET /api/activity/ — API returns array or { results } */
export interface ApiActivity {
  id: string
  type: string
  entity_type: string
  entity_id: string | null
  notes: string | null
  duration_minutes: number | null
  actor: string | { id: string; name: string }
  logged_at: string
  created_at?: string
  updated_at?: string
  metadata?: Record<string, unknown>
  workspace?: string
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

  activity: (params?: {
    entity_type?: string
    entity_id?: string
    actor?: string
    type?: string
    search?: string
    page_size?: number
    limit?: number
    cursor?: string
  }) => {
    const search = new URLSearchParams()
    if (params?.entity_type) search.set('entity_type', params.entity_type)
    if (params?.entity_id) search.set('entity_id', params.entity_id)
    if (params?.actor) search.set('actor', params.actor)
    if (params?.type) search.set('type', params.type)
    if (params?.search) search.set('search', params.search)
    if (params?.page_size) search.set('page_size', String(params.page_size))
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<ApiActivity[] | CursorPaginatedResponse<ApiActivity>>(`/api/activity/${qs ? `?${qs}` : ''}`)
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
