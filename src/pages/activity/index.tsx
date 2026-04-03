import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type ApiActivity } from '@/api/dashboard'
import type { CursorPaginatedResponse } from '@/api/dashboard'
import { usersApi } from '@/api/auth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { ActivityHeader } from './components/ActivityHeader'
import { ActivityTable, type ActivityRow } from './components/ActivityTable'
import { mapActivityType, mapActivityTitle } from '../dashboard/utils'
import type { ActivityDisplayType } from './components/ActivityTable'
import { parseNextCursor } from '@/lib/pagination'

const ACTIVITY_QUERY_KEY = ['activity', 'list']

/** Map UI entity type to API entity_type (API uses plural: leads, contacts, tasks, deals, companies) */
const ENTITY_TYPE_TO_API: Record<ActivityDisplayType, string> = {
  lead: 'leads',
  contact: 'contacts',
  task: 'tasks',
  deal: 'deals',
  company: 'companies',
}

export default function ActivityPage() {
  const { pageSize, cursor, pageIndex, hasPrev, resetPagination, goNext, goPrev, handlePageSizeChange } = useCursorPagination()
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState<ActivityDisplayType | 'all'>('all')
  const [activityType, setActivityType] = useState<string>('all')
  const [actorId, setActorId] = useState<string>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })
  const users = usersData?.data ?? []

  const { data, isLoading } = useQuery({
    queryKey: [...ACTIVITY_QUERY_KEY, pageSize, cursor, debouncedSearch, entityType, activityType, actorId],
    queryFn: () =>
      dashboardApi.activity({
        page_size: pageSize,
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        entity_type: entityType === 'all' ? undefined : ENTITY_TYPE_TO_API[entityType],
        type: activityType === 'all' ? undefined : activityType,
        actor: actorId === 'all' ? undefined : actorId,
      }),
  })

  const rawData = data?.data
  const activities: ApiActivity[] = (() => {
    if (!rawData) return []
    return Array.isArray(rawData) ? rawData : (rawData as CursorPaginatedResponse<ApiActivity>).results ?? []
  })()
  const response = Array.isArray(rawData) ? null : (rawData as CursorPaginatedResponse<ApiActivity> | undefined)
  const totalCount = response?.count ?? activities.length
  const nextCursor = parseNextCursor(response?.next ?? null)
  const hasNext = !!nextCursor

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    resetPagination()
  }, [resetPagination])

  const handleEntityTypeChange = useCallback((value: ActivityDisplayType | 'all') => {
    setEntityType(value)
    resetPagination()
  }, [resetPagination])

  const handleActivityTypeChange = useCallback((value: string) => {
    setActivityType(value)
    resetPagination()
  }, [resetPagination])

  const handleActorIdChange = useCallback((value: string) => {
    setActorId(value)
    resetPagination()
  }, [resetPagination])

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
      user: typeof a.actor === 'string' ? a.actor : a.actor?.name ?? '',
      timestamp: new Date(a.logged_at ?? a.created_at ?? '').toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      logged_at: a.logged_at,
    }
  })

  const startRow = pageIndex * pageSize + 1
  const endRow = pageIndex * pageSize + rows.length
  const paginationLabel =
    rows.length === 0 ? 'No results' : hasNext ? `${startRow}–${endRow}+` : `${startRow}–${endRow} of ${totalCount}`

  return (
    <div className="space-y-6">
      <ActivityHeader total={totalCount} />
      <ActivityTable
        activities={rows}
        isLoading={isLoading}
        entityType={entityType}
        onEntityTypeChange={handleEntityTypeChange}
        activityType={activityType}
        onActivityTypeChange={handleActivityTypeChange}
        actorId={actorId}
        onActorIdChange={handleActorIdChange}
        users={users}
        serverSide={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          hasNext,
          hasPrev,
          onNext: () => goNext(nextCursor),
          onPrev: goPrev,
          totalLabel: paginationLabel,
          searchValue: search,
          onSearchChange: handleSearchChange,
        }}
      />
    </div>
  )
}
