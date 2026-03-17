import { api } from '@/lib/api'

/** Create lead - POST /api/leads/ */
export interface CreateLeadRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status?: string
  source?: string
  notes?: string
  value?: string
}

/** Create contact - POST /api/contacts/ */
export interface CreateContactRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status?: string
  tags?: string[]
}

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

export const leadsApi = {
  create: (data: CreateLeadRequest) => api.post('/api/leads/', data),
}

export const contactsApi = {
  create: (data: CreateContactRequest) => api.post('/api/contacts/', data),
}

export const tasksApi = {
  create: (data: CreateTaskRequest) => api.post('/api/tasks/', data),
}
