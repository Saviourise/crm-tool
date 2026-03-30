import { api } from '@/lib/api'

/** Create task - POST /api/tasks/ */
export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  category?: 'call' | 'email' | 'meeting' | 'follow_up' | 'demo' | 'other'
  due_date?: string
  related_type?: string
  related_id?: string
}

export const tasksApi = {
  create: (data: CreateTaskRequest) => api.post('/api/tasks/', data),
}

// Re-export leadsApi from the canonical leads module
export { leadsApi } from '@/api/leads'
export type { CreateLeadRequest } from '@/api/leads'
