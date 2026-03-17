import { Clock, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/router/routes'
import { DashboardEmptyState } from './DashboardEmptyState'
import { activityIcons, activityColors, type ActivityRow } from '../../activity/components/ActivityTable'

interface RecentActivityProps {
  activities: ActivityRow[]
  isLoading?: boolean
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const navigate = useNavigate()
  const isEmpty = activities.length === 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        {!isEmpty && !isLoading && (
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => navigate(ROUTES.ACTIVITY)}
          >
            View All
          </button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <DashboardEmptyState
            icon={Activity}
            title="No activity yet"
            description="Activity will appear here as you create leads, contacts, and deals."
          />
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.displayType]
              return (
                <div key={activity.id} className="flex items-start gap-4 capitalize">
                  <div
                    className={cn(
                      'p-2 rounded-lg bg-muted',
                      activityColors[activity.displayType]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {activity.user
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
