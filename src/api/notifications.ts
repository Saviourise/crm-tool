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

export const notificationsApi = {
  list: (params?: { is_read?: boolean; search?: string; page_size?: number; limit?: number; cursor?: string }) => {
    const qs = new URLSearchParams()
    if (params?.is_read === false) qs.set('is_read', 'false')
    if (params?.search) qs.set('search', params.search)
    if (params?.page_size) qs.set('page_size', String(params.page_size))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.cursor) qs.set('cursor', params.cursor)
    const query = qs.toString()
    return api.get<NotificationsListResponse>(`/api/notifications/${query ? `?${query}` : ''}`)
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
