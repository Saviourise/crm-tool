import { Mail, Phone, FileText, CheckSquare, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

type ActivityType = 'email' | 'call' | 'note' | 'task' | 'meeting'

interface ApiActivityEntry {
  id: string
  type: ActivityType
  summary?: string
  actor?: { id: string; name: string }
  timestamp: string
}

const iconMap: Record<ActivityType, React.ElementType> = {
  email: Mail,
  call: Phone,
  note: FileText,
  task: CheckSquare,
  meeting: CheckSquare,
}

const iconBgMap: Record<ActivityType, string> = {
  email: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  call: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  note: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  task: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  meeting: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
}

interface DealActivityTimelineProps {
  dealId: string
}

export function DealActivityTimeline({ dealId }: DealActivityTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', 'deals', dealId, 'activity'],
    queryFn: () =>
      api.get<{ results: ApiActivityEntry[] }>(`/api/pipeline/deals/${dealId}/activity/`),
    enabled: !!dealId,
  })

  const activities = data?.data?.results ?? []

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Activity History</h3>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No activity recorded yet.</p>
        )}

        {!isLoading && activities.length > 0 && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="flex flex-col gap-6">
              {activities.map((activity) => {
                const type = (iconMap[activity.type] ? activity.type : 'note') as ActivityType
                const Icon = iconMap[type]
                const timeAgo = (() => {
                  try {
                    return formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                  } catch {
                    return activity.timestamp
                  }
                })()

                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10',
                        iconBgMap[type]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium capitalize">{activity.type}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
                      </div>
                      {activity.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.summary}</p>
                      )}
                      {activity.actor && (
                        <p className="text-xs text-muted-foreground mt-0.5">by {activity.actor.name}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
