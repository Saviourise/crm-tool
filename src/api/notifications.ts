import type { AxiosResponse } from 'axios'
import { api } from '@/lib/api'

export type EmailDigest = 'daily' | 'weekly' | 'never'

/** Per-event pref as returned by the API (snake_case) */
export interface ApiEventPref {
  email: boolean
  in_app: boolean
}

export interface ApiNotificationPreferences {
  preferences: Record<string, ApiEventPref>
  email_digest: EmailDigest
}

export interface ApiNotification {
  id: string
  type: string
  title: string
  body: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface NotificationsListResponse {
  count: number
  unread_count: number
  results: ApiNotification[]
  next?: string | null
  previous?: string | null
}

/** Backend may return DRF cursor shape or a bare array; normalize for the UI. */
function normalizeNotificationsListResponse(
  raw: unknown
): NotificationsListResponse {
  if (Array.isArray(raw)) {
    const results = raw as ApiNotification[]
    const unread_count = results.filter((n) => !n.is_read).length
    return {
      count: results.length,
      unread_count,
      results,
      next: null,
      previous: null,
    }
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as NotificationsListResponse).results)) {
    const o = raw as Partial<NotificationsListResponse> & { results: ApiNotification[] }
    const results = o.results
    const unread_count =
      typeof o.unread_count === 'number'
        ? o.unread_count
        : results.filter((n) => !n.is_read).length
    return {
      count: typeof o.count === 'number' ? o.count : results.length,
      unread_count,
      results,
      next: o.next ?? null,
      previous: o.previous ?? null,
    }
  }
  return { count: 0, unread_count: 0, results: [], next: null, previous: null }
}

export const notificationsApi = {
  list: async (params?: {
    is_read?: boolean
    search?: string
    page_size?: number
    limit?: number
    cursor?: string
  }): Promise<AxiosResponse<NotificationsListResponse>> => {
    const qs = new URLSearchParams()
    if (params?.is_read === false) qs.set('is_read', 'false')
    if (params?.search) qs.set('search', params.search)
    if (params?.page_size) qs.set('page_size', String(params.page_size))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.cursor) qs.set('cursor', params.cursor)
    const query = qs.toString()
    const res = await api.get<NotificationsListResponse | ApiNotification[]>(
      `/api/notifications/${query ? `?${query}` : ''}`
    )
    return { ...res, data: normalizeNotificationsListResponse(res.data) }
  },

  markRead: (id: string) =>
    api.patch<ApiNotification>(`/api/notifications/${id}/read/`),

  markAllRead: () =>
    api.post<{ message?: string; updated?: number }>('/api/notifications/read-all/'),
}

export const notificationPrefsApi = {
  get: () =>
    api.get<ApiNotificationPreferences>('/api/notifications/preferences/'),

  update: (data: ApiNotificationPreferences) =>
    api.patch<ApiNotificationPreferences>('/api/notifications/preferences/', data),
}
