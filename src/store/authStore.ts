import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/utils/constants'

export interface AuthTokensState {
  accessToken: string | null
  refreshToken: string | null
  workspaceId: string | null
  setTokens: (access: string, refresh: string, workspaceId?: string) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthTokensState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      workspaceId: null,
      setTokens: (access, refresh, workspaceId) =>
        set({ accessToken: access, refreshToken: refresh, workspaceId: workspaceId ?? null }),
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
