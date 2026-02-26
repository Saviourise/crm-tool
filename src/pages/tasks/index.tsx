import { useState } from 'react'
import { toast } from 'sonner'
import { TasksHeader } from './components/TasksHeader'
import { TasksStats } from './components/TasksStats'
import { TasksTable } from './components/TasksTable'
import { MOCK_TASKS } from './data'
import type { Task } from './typings'

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next = t.status === 'completed' ? 'todo' : 'completed'
        return { ...t, status: next }
      })
    )
  }

  const handleBulkAction = (ids: string[], action: 'complete' | 'todo' | 'delete') => {
    if (action === 'delete') {
      setTasks((prev) => prev.filter((t) => !ids.includes(t.id)))
      toast.error(`${ids.length} task${ids.length !== 1 ? 's' : ''} deleted`)
      return
    }
    const newStatus = action === 'complete' ? 'completed' : 'todo'
    setTasks((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, status: newStatus } : t))
    )
    const label = action === 'complete' ? 'marked as complete' : 'reopened'
    toast.success(`${ids.length} task${ids.length !== 1 ? 's' : ''} ${label}`)
  }

  return (
    <div className="space-y-6">
      <TasksHeader total={tasks.length} />
      <TasksStats tasks={tasks} />
      <TasksTable
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onBulkAction={handleBulkAction}
      />
    </div>
  )
}
