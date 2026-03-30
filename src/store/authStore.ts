import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/utils/constants'

export interface AuthTokensState {
  accessToken: string | null
  refreshToken: string | null
  workspaceId: string | null
  /** When `workspaceId` is omitted, the current workspace is kept (required for token refresh). */
  setTokens: (access: string, refresh: string, workspaceId?: string | null) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthTokensState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      workspaceId: null,
      setTokens: (access, refresh, workspaceId) =>
        set((state) => ({
          accessToken: access,
          refreshToken: refresh,
          workspaceId: workspaceId !== undefined ? workspaceId : state.workspaceId,
        })),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, workspaceId: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKENS,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
