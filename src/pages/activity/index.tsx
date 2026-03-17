import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { dashboardApi, type ApiActivity } from '@/api/dashboard'
import type { CursorPaginatedResponse } from '@/api/dashboard'
import { ActivityHeader } from './components/ActivityHeader'
import { ActivityTable, type ActivityRow } from './components/ActivityTable'
import { mapActivityType, mapActivityTitle } from '../dashboard/utils'

const PAGE_SIZE = 500

export default function ActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', 'list'],
    queryFn: () =>
      dashboardApi.activity({
        page_size: PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
  })

  const rawData = data?.data
  const activities: ApiActivity[] = (() => {
    if (!rawData) return []
    return Array.isArray(rawData) ? rawData : (rawData as CursorPaginatedResponse<ApiActivity>).results ?? []
  })()

  const rows: ActivityRow[] = activities.map((a) => {
    const notes = a.notes ?? ''
    const description = /^POST\s+\/api\//i.test(notes) ? '' : notes
    return {
      id: a.id,
      type: a.type,
      entity_type: a.entity_type,
      displayType: mapActivityType(a.entity_type),
      title: mapActivityTitle(a.type, a.entity_type),
      description,
      timestamp: formatDistanceToNow(new Date(a.logged_at), { addSuffix: true }),
      user: 'Team member',
      logged_at: a.logged_at,
    }
  })

  return (
    <div className="space-y-6">
      <ActivityHeader total={rows.length} />
      <ActivityTable activities={rows} isLoading={isLoading} />
    </div>
  )
}
