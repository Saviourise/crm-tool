import { api } from '@/lib/api'
import type { ApiChatSession } from './types'

/**
 * AI Chat API — requires Bearer + X-Workspace-ID.
 * Responses use workspace_id (workspace_slug was removed in 2026-03-09 migration).
 */
export const chatApi = {
  listSessions: () =>
    api.get<ApiChatSession[]>('/api/ai/chat/sessions/'),

  getSession: (sessionId: string) =>
    api.get<ApiChatSession>(`/api/ai/chat/sessions/${sessionId}/`),

  updateSession: (sessionId: string, data: Partial<Pick<ApiChatSession, 'title'>>) =>
    api.patch<ApiChatSession>(`/api/ai/chat/sessions/${sessionId}/`, data),
}
