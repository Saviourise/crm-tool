import { api } from '@/lib/api'

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
}

export const notificationsApi = {
  list: (params?: { is_read?: boolean }) => {
    const search = new URLSearchParams()
    if (params?.is_read === false) search.set('is_read', 'false')
    const qs = search.toString()
    return api.get<NotificationsListResponse>(`/api/notifications/${qs ? `?${qs}` : ''}`)
  },

  markRead: (id: string) =>
    api.patch<ApiNotification>(`/api/notifications/${id}/read/`),

  markAllRead: () =>
    api.post<{ message?: string; updated?: number }>('/api/notifications/read-all/'),
}
