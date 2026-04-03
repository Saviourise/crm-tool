import { api } from '@/lib/api'

// ─── Generic Integrations ──────────────────────────────────────────────────────

export type IntegrationStatus = 'connected' | 'disconnected'

export interface ApiIntegration {
  id: string
  name: string
  description: string
  category: string
  status: IntegrationStatus
  icon_name: string
  connected_account?: string | null
}

export interface IntegrationsListResponse {
  results: ApiIntegration[]
}

// ─── Fireflies ─────────────────────────────────────────────────────────────────

export interface FirefliesIntegration {
  enabled: boolean
  webhook_url: string
  secret?: string
  api_key?: string
  created_at: string
}

export interface FirefliesEnableResponse {
  webhook_url: string
  secret: string
  enabled: boolean
  created_at: string
}

export interface FirefliesEnablePayload {
  api_key: string
}

export type MeetingImportStatus = 'processing' | 'completed' | 'failed'

export interface MeetingImport {
  id: string
  meeting_title: string
  meeting_date: string | null
  participants: string[]
  tasks_created: number
  contacts_created: number
  leads_created: number
  deals_created: number
  raw_summary: string
  status: MeetingImportStatus
  error_message: string
  created_at: string
}

export interface MeetingImportsResponse {
  results: MeetingImport[]
  count: number
  next: string | null
  previous: string | null
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const integrationsApi = {
  // Generic integrations list
  list: () =>
    api.get<IntegrationsListResponse>('/api/integrations/'),

  connect: (id: string) =>
    api.post<ApiIntegration>(`/api/integrations/${id}/connect/`),

  disconnect: (id: string) =>
    api.delete<void>(`/api/integrations/${id}/connect/`),

  // Fireflies-specific
  getFireflies: () =>
    api.get<FirefliesIntegration>('/api/integrations/fireflies/'),

  enableFireflies: (payload: FirefliesEnablePayload) =>
    api.post<FirefliesEnableResponse>('/api/integrations/fireflies/', payload),

  disableFireflies: () =>
    api.delete('/api/integrations/fireflies/'),

  listMeetings: (params?: { limit?: number; cursor?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<MeetingImportsResponse>(
      `/api/integrations/fireflies/meetings/${qs ? `?${qs}` : ''}`
    )
  },

  getMeeting: (id: string) =>
    api.get<MeetingImport>(`/api/integrations/fireflies/meetings/${id}/`),
}
