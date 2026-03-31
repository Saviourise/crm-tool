import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, FileText, CheckSquare, Video } from 'lucide-react'
import { api } from '@/lib/api'
import { ActivityTimelineCard } from '@/components/common/ActivityTimelineCard'

type ActivityType = 'email' | 'call' | 'note' | 'task' | 'meeting'

interface ApiActivityEntry {
  id: string
  type: string
  summary?: string
  actor?: { id: string; name: string }
  timestamp: string
}

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

function normalizeType(type: string): ActivityType {
  const t = type.toLowerCase()
  return (['email', 'call', 'note', 'task', 'meeting'].includes(t) ? t : 'note') as ActivityType
}

function formatTime(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  } catch {
    return timestamp
  }
}

interface EntityActivityTimelineProps {
  queryKey: readonly unknown[]
  endpoint: string
  title?: string
}

export function EntityActivityTimeline({ queryKey, endpoint, title }: EntityActivityTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get<{ results: ApiActivityEntry[] }>(endpoint),
    enabled: Boolean(endpoint),
  })

  const items = (data?.data?.results ?? []).map((activity) => ({
    id: activity.id,
    type: activity.type,
    title: activity.type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
    description: activity.summary,
    actor: activity.actor?.name,
    time: formatTime(activity.timestamp),
  }))

  return (
    <ActivityTimelineCard
      title={title}
      isLoading={isLoading}
      items={items}
      getAppearance={(type) => {
        const safeType = normalizeType(type)
        return {
          icon: iconMap[safeType],
          className: iconBgMap[safeType],
        }
      }}
    />
  )
}
