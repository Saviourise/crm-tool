export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled'
export type TaskCategory = 'call' | 'email' | 'meeting' | 'follow-up' | 'demo' | 'proposal' | 'other'

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  /** ISO date string (YYYY-MM-DD) — format for display in the column cell */
  dueDate?: string
  assignedTo: string
  assignedToId?: string
  relatedTo?: {
    type: 'contact' | 'lead' | 'deal'
    id: string
    name: string
  }
  createdAt: string
}
