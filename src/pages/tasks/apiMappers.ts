import type { ApiTask } from '@/api/tasks'
import type { Task, TaskStatus, TaskPriority, TaskCategory } from './typings'

export const API_TO_FRONTEND_STATUS: Record<string, TaskStatus> = {
  pending: 'todo',
  in_progress: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

export const FRONTEND_TO_API_STATUS: Record<TaskStatus, string> = {
  todo: 'pending',
  'in-progress': 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

export const API_TO_FRONTEND_CATEGORY: Record<string, TaskCategory> = {
  call: 'call',
  email: 'email',
  meeting: 'meeting',
  follow_up: 'follow-up',
  demo: 'demo',
  proposal: 'proposal',
  other: 'other',
}

export const FRONTEND_TO_API_CATEGORY: Record<TaskCategory, string> = {
  call: 'call',
  email: 'email',
  meeting: 'meeting',
  'follow-up': 'follow_up',
  demo: 'demo',
  proposal: 'proposal',
  other: 'other',
}

function resolveName(v: { id: string; name: string } | string | null | undefined): string {
  if (!v) return ''
  return typeof v === 'object' ? v.name : v
}

function resolveId(v: { id: string; name: string } | string | null | undefined): string | undefined {
  if (!v) return undefined
  return typeof v === 'object' ? v.id : v
}

export function mapApiTaskToTask(api: ApiTask): Task {
  const relatedTo = api.related
    ? {
        type: api.related.type as 'contact' | 'lead' | 'deal',
        id: api.related.id,
        name: api.related.name,
      }
    : api.related_type && api.related_id
    ? {
        type: api.related_type as 'contact' | 'lead' | 'deal',
        id: api.related_id,
        name: api.related_id,
      }
    : undefined

  return {
    id: api.id,
    title: api.title,
    description: api.description ?? undefined,
    priority: (api.priority as TaskPriority) ?? 'medium',
    status: API_TO_FRONTEND_STATUS[api.status] ?? 'todo',
    category: API_TO_FRONTEND_CATEGORY[api.category] ?? 'other',
    dueDate: api.due_date ? api.due_date.split('T')[0] : undefined,
    assignedTo: resolveName(api.assigned_to),
    assignedToId: resolveId(api.assigned_to),
    relatedTo,
    createdAt: api.created_at,
  }
}
