export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date
  assignedTo: string
  relatedTo?: {
    type: 'contact' | 'lead' | 'opportunity'
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}
