import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { useAuth } from '@/auth/context'

interface TasksHeaderProps {
  total: number
  isLoading?: boolean
  onReload?: () => void
}

export function TasksHeader({ total, isLoading, onReload }: TasksHeaderProps) {
  const { can } = useAuth()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          {total} task{total !== 1 ? 's' : ''} across all categories
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onReload && (
          <Button variant="outline" size="sm" onClick={onReload} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
        {can('tasks.create') && (
          <NewTaskDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
