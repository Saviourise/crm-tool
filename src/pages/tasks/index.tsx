import { useState } from 'react'
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

  return (
    <div className="space-y-6">
      <TasksHeader total={tasks.length} />
      <TasksStats tasks={tasks} />
      <TasksTable tasks={tasks} onToggleComplete={handleToggleComplete} />
    </div>
  )
}
