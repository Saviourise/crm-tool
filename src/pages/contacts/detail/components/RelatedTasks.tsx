import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { contactsApi } from '@/api/contacts'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'

interface RelatedTasksProps {
  contactId: string
  contactName?: string
}

const priorityStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  urgent: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
}

const statusStyles: Record<string, string> = {
  todo: 'bg-muted text-muted-foreground border-border',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatDueDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function RelatedTasks({ contactId, contactName }: RelatedTasksProps) {
  const [newTaskOpen, setNewTaskOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', contactId, 'tasks'],
    queryFn: () => contactsApi.tasks(contactId),
    enabled: !!contactId,
  })

  const tasks = data?.data?.results ?? []

  return (
    <>
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Related Tasks</h3>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setNewTaskOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks found.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {tasks.map((task) => (
              <div key={task.id} className="py-2.5 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug line-clamp-1 flex-1">{task.title}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize shrink-0', priorityStyles[task.priority] ?? '')}
                  >
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Due: {formatDueDate(task.due_date)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusStyles[task.status] ?? '')}
                  >
                    {statusLabels[task.status] ?? task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    <NewTaskDialog
      open={newTaskOpen}
      onOpenChange={setNewTaskOpen}
      relatedType="contact"
      relatedId={contactId}
      relatedName={contactName}
    />
    </>
  )
}
