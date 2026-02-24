import { TaskPriority } from './typings'

// Task utility functions
export const getPriorityColor = (priority: TaskPriority): string => {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  }
  return colors[priority]
}

export const isTaskOverdue = (dueDate?: Date): boolean => {
  if (!dueDate) return false
  return dueDate < new Date()
}
