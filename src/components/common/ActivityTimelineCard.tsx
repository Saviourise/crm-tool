import type React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ActivityTimelineItem {
  id: string
  type: string
  title: string
  time: string
  description?: string
  actor?: string
}

export interface ActivityTimelineAppearance {
  icon: React.ElementType
  className: string
}

interface ActivityTimelineCardProps {
  title?: string
  isLoading?: boolean
  emptyMessage?: string
  items: ActivityTimelineItem[]
  getAppearance: (type: string) => ActivityTimelineAppearance
}

export function ActivityTimelineCard({
  title = 'Activity History',
  isLoading = false,
  emptyMessage = 'No activity recorded yet.',
  items,
  getAppearance,
}: ActivityTimelineCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">{title}</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="flex flex-col gap-6">
              {items.map((item) => {
                const { icon: Icon, className } = getAppearance(item.type)
                return (
                  <div key={item.id} className="flex gap-4 relative">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10', className)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                      {(item.actor || item.description) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[item.actor, item.description].filter(Boolean).join(' · ')}
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
