import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/users'

export interface WorkspaceUser {
  /** The user's UUID — use this as the `assigned_to` value when writing to the API. */
  id: string
  name: string
  email: string
}

export const WORKSPACE_USERS_QUERY_KEY = ['workspace-users']

export function useWorkspaceUsers() {
  const { data, isLoading } = useQuery({
    queryKey: WORKSPACE_USERS_QUERY_KEY,
    queryFn: () => usersApi.list(),
    staleTime: 5 * 60 * 1000,
  })

  const users: WorkspaceUser[] = (data?.data ?? [])
    .filter((m) => m.is_active)
    .map((m) => ({
      id: m.user.id,
      name: m.user.name ?? '',
      email: m.user.email,
    }))

  return { users, isLoading }
}
