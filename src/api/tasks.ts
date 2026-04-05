import { api } from '@/lib/api'

export interface ApiTask {
  id: string
  title: string
  description?: string | null
  priority: string
  status: string
  category: string
  due_date?: string | null
  assigned_to?: { id: string; name: string } | string | null
  related?: { id: string; type: string; name: string } | null
  related_type?: string | null
  related_id?: string | null
  created_at: string
  updated_at?: string
}

export interface TaskStatsResponse {
  all: number
  to_do: number
  in_progress: number
  completed: number
  cancelled: number
  overdue: number
}

export interface TaskListParams {
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  search?: string
  ordering?: string
  limit?: number
  cursor?: string
}

export interface CursorPaginatedTasksResponse {
  results: ApiTask[]
  next: string | null
  previous: string | null
  count?: number
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: string
  status?: string
  category?: string
  due_date?: string
  assigned_to?: string | null
  related_type?: string
  related_id?: string
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>

export const tasksApi = {
  list: (params?: TaskListParams) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.priority) search.set('priority', params.priority)
    if (params?.category) search.set('category', params.category)
    if (params?.assigned_to) search.set('assigned_to', params.assigned_to)
    if (params?.search) search.set('search', params.search)
    if (params?.ordering) search.set('ordering', params.ordering)
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.cursor) search.set('cursor', params.cursor)
    const qs = search.toString()
    return api.get<CursorPaginatedTasksResponse>(`/api/tasks/${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) => api.get<ApiTask>(`/api/tasks/${id}/`),

  create: (data: CreateTaskRequest) => api.post<ApiTask>('/api/tasks/', data),

  update: (id: string, data: UpdateTaskRequest) =>
    api.patch<ApiTask>(`/api/tasks/${id}/`, data),

  delete: (id: string) => api.delete(`/api/tasks/${id}/`),

  bulkDelete: (ids: string[]) =>
    api.post<{ deleted: number }>('/api/tasks/bulk/', { action: 'delete', ids }),

  stats: () => api.get<TaskStatsResponse>('/api/tasks/stats/'),
}
