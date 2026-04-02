import type { QueryClient } from '@tanstack/react-query'
import type { ApiContact } from '@/api/contacts'
import type { ApiCompany } from '@/api/companies'
import type { ApiLead } from '@/api/leads'
import type { ApiTask } from '@/api/tasks'

type ListBody<T> = {
  results?: T[]
  count?: number
  next?: string | null
  previous?: string | null
}

type CachedListResponse<T> = { data: ListBody<T> }

function patchListItem<T extends { id: string }>(
  old: unknown,
  id: string,
  updated: T
): unknown {
  if (!old || typeof old !== 'object' || !('data' in old)) return old
  const cached = old as CachedListResponse<T>
  const body = cached.data
  if (!Array.isArray(body?.results)) return old
  const idx = body.results.findIndex((r) => r.id === id)
  if (idx === -1) return old
  const results = [...body.results]
  results[idx] = updated
  return { ...cached, data: { ...body, results } }
}

export function patchContactsListCaches(queryClient: QueryClient, id: string, api: ApiContact) {
  queryClient.setQueriesData({ queryKey: ['contacts'], exact: false }, (old) =>
    patchListItem(old, id, api)
  )
}

export function patchCompaniesListCaches(queryClient: QueryClient, id: string, api: ApiCompany) {
  queryClient.setQueriesData({ queryKey: ['companies'], exact: false }, (old) =>
    patchListItem(old, id, api)
  )
}

export function patchLeadsListCaches(queryClient: QueryClient, id: string, api: ApiLead) {
  queryClient.setQueriesData({ queryKey: ['leads'], exact: false }, (old) =>
    patchListItem(old, id, api)
  )
}

export function patchTasksListCaches(queryClient: QueryClient, id: string, api: ApiTask) {
  queryClient.setQueriesData({ queryKey: ['tasks'], exact: false }, (old) =>
    patchListItem(old, id, api)
  )
}
