import { Mail, Phone, FileText, CheckSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ActivityType = 'email' | 'call' | 'note' | 'task'

interface Activity {
  type: ActivityType
  title: string
  time: string
  description: string
}

const MOCK_ACTIVITIES: Activity[] = [
  { type: 'email', title: 'Follow-up email sent', time: '2 hours ago', description: 'Sent proposal follow-up' },
  { type: 'call', title: 'Discovery call', time: '2 days ago', description: '30 min call — discussed requirements' },
  { type: 'note', title: 'Note added', time: '3 days ago', description: 'Interested in enterprise plan' },
  { type: 'email', title: 'Initial outreach', time: '1 week ago', description: 'Sent introduction email' },
  { type: 'task', title: 'Task completed', time: '2 weeks ago', description: 'Demo scheduled' },
]

const iconMap: Record<ActivityType, React.ElementType> = {
  email: Mail,
  call: Phone,
  note: FileText,
  task: CheckSquare,
}

const iconBgMap: Record<ActivityType, string> = {
  email: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  call: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  note: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  task: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
}

export function DealActivityTimeline() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Activity History</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="flex flex-col gap-6">
            {MOCK_ACTIVITIES.map((activity, index) => {
              const Icon = iconMap[activity.type]
              return (
                <div key={index} className="flex gap-4 relative">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10',
                      iconBgMap[activity.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
