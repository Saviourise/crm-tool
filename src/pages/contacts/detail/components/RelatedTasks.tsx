import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_TASKS } from '@/pages/tasks/data'

interface RelatedTasksProps {
  contactName: string
}

const priorityStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  urgent: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
}

const statusStyles: Record<string, string> = {
  'todo': 'bg-muted text-muted-foreground border-border',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  'cancelled': 'bg-muted text-muted-foreground border-border',
}

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
}

export function RelatedTasks({ contactName }: RelatedTasksProps) {
  const matched = MOCK_TASKS.filter(
    (t) => t.relatedTo && t.relatedTo.name === contactName
  )
  const tasks = matched.length > 0 ? matched : MOCK_TASKS.slice(0, 3)

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Related Tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks found.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {tasks.map((task) => (
              <div key={task.id} className="py-2.5 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug line-clamp-1 flex-1">{task.title}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize shrink-0', priorityStyles[task.priority])}
                  >
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusStyles[task.status])}
                  >
                    {statusLabels[task.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
