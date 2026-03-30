import { useQuery } from '@tanstack/react-query'
import { Mail, Phone, FileText, CheckSquare, Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { leadsApi } from '@/api/leads'

interface ActivityTimelineProps {
  leadId: string
}

type ActivityType = 'email' | 'call' | 'note' | 'task' | 'meeting'

const iconMap: Record<ActivityType, React.ElementType> = {
  email: Mail,
  call: Phone,
  note: FileText,
  task: CheckSquare,
  meeting: Video,
}

const iconBgMap: Record<ActivityType, string> = {
  email: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  call: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  note: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  task: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  meeting: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
}

const normalizeType = (t: string): ActivityType =>
  (['email', 'call', 'note', 'task', 'meeting'].includes(t) ? t : 'note') as ActivityType

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString()
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['leads', leadId, 'activity'],
    queryFn: () => leadsApi.activity(leadId),
    enabled: !!leadId,
  })

  const results = data?.data?.results ?? []
  const activities = results.map((r) => ({
    id: r.id,
    type: normalizeType(r.type),
    title: r.summary?.trim() || (r.type.charAt(0).toUpperCase() + r.type.slice(1)),
    time: formatRelativeTime(r.timestamp),
    description: r.summary ?? '',
    actor: r.actor?.name,
  }))

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Activity History</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No activity recorded yet.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="flex flex-col gap-6">
              {activities.map((activity) => {
                const Icon = iconMap[activity.type]
                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10', iconBgMap[activity.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                      </div>
                      {(activity.actor || activity.description) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[activity.actor, activity.description].filter(Boolean).join(' · ')}
                        </p>
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
