import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { mapApiTaskToTask, FRONTEND_TO_API_STATUS } from './apiMappers'
import type { TaskStatus } from './typings'
import { TasksHeader } from './components/TasksHeader'
import { TasksStats } from './components/TasksStats'
import { TasksTable } from './components/TasksTable'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { TASKS_QUERY_KEY } from './queryKeys'

export { TASKS_QUERY_KEY }

export default function Tasks() {
  const queryClient = useQueryClient()
  const { pageSize, cursor, pageIndex, hasPrev, resetPagination, goNext, goPrev, handlePageSizeChange } =
    useCursorPagination()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [assignedTo, setAssignedTo] = useState('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [...TASKS_QUERY_KEY, pageSize, cursor, debouncedSearch, status, priority, assignedTo],
    queryFn: () =>
      tasksApi.list({
        limit: pageSize,
        cursor,
        search: debouncedSearch.trim() || undefined,
        status: status === 'all' ? undefined : FRONTEND_TO_API_STATUS[status as TaskStatus],
        priority: priority === 'all' ? undefined : priority,
        assigned_to: assignedTo === 'all' ? undefined : assignedTo,
      }),
  })

  const [listReloading, setListReloading] = useState(false)
  const listBusy = isLoading || listReloading

  const handleListReload = useCallback(async () => {
    setListReloading(true)
    try {
      await queryClient.refetchQueries({ queryKey: TASKS_QUERY_KEY, exact: false })
    } finally {
      setListReloading(false)
    }
  }, [queryClient])

  const response = data?.data
  const tasks = (response?.results ?? []).map(mapApiTaskToTask)
  const totalCount = response?.count ?? tasks.length
  const nextCursor = response?.next ?? null
  const hasNext = !!nextCursor

  const handleSearchChange = useCallback((v: string) => { setSearch(v); resetPagination() }, [resetPagination])
  const handleStatusChange = useCallback((v: string) => { setStatus(v); resetPagination() }, [resetPagination])
  const handlePriorityChange = useCallback((v: string) => { setPriority(v); resetPagination() }, [resetPagination])
  const handleAssignedToChange = useCallback((v: string) => { setAssignedTo(v); resetPagination() }, [resetPagination])

  const paginationLabel =
    tasks.length === 0
      ? 'No results'
      : `${pageIndex * pageSize + 1}–${pageIndex * pageSize + tasks.length} of ${totalCount}`

  return (
    <div className="space-y-6">
      <TasksHeader total={totalCount} isLoading={listBusy} onReload={handleListReload} />
      <TasksStats />
      <TasksTable
        tasks={tasks}
        isLoading={listBusy}
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        priority={priority}
        onPriorityChange={handlePriorityChange}
        assignedTo={assignedTo}
        onAssignedToChange={handleAssignedToChange}
        serverSide={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          hasNext,
          hasPrev,
          onNext: () => goNext(nextCursor),
          onPrev: goPrev,
          totalLabel: paginationLabel,
        }}
      />
    </div>
  )
}
