import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardEmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

/** Consistent empty state for dashboard sections. Use inside CardContent or similar. */
export function DashboardEmptyState({ icon: Icon, title, description, className }: DashboardEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{description}</p>}
    </div>
  )
}
