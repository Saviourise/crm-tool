import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { AuthUser, AuthState, RoleId, Permission, Feature, PlanId } from './types'
import { hasPermission, hasFeature, planMeetsMinimum } from './permissions'
import { useAuthStore } from '@/store/authStore'
import { authApi, workspaceSwitchApi, usersApi, workspaceApi } from '@/api/auth'
import type { ApiUser } from '@/api/types'
import { mapApiUserToAuthUser, mapApiUserToAuthUserMinimal, getRoleNameFromRole } from './apiMappers'
import { STORAGE_KEYS } from '@/utils/constants'
import { navigateToLogin } from '@/lib/logoutNavigate'

const AUTH_KEY = STORAGE_KEYS.AUTH_USER

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>
  signup: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  acceptInvite: (token: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  completeOnboarding: () => void
  can: (permission: Permission) => boolean
  hasPlan: (feature: Feature) => boolean
  planAtLeast: (plan: PlanId) => boolean
  onboardingComplete: boolean | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

import { getUserIdFromToken } from '@/lib/jwt'

interface HydrateResult {
  user: AuthUser
  onboardingComplete: boolean
}

async function hydrateUserFromApi(): Promise<HydrateResult | null> {
  const { accessToken, refreshToken, workspaceId: storedWorkspaceId, setTokens } = useAuthStore.getState()
  if (!accessToken) return null

  const currentUserId = getUserIdFromToken(accessToken)
  if (!currentUserId) return null

  try {
    const workspacesRes = await workspaceSwitchApi.listWorkspaces()
    const workspaces = workspacesRes.data
    if (!workspaces?.length) return null

    // Prefer workspace matching stored workspaceId (e.g. from completed onboarding)
    const workspace = storedWorkspaceId
      ? workspaces.find((w) => w.id === storedWorkspaceId) ?? workspaces[0]
      : workspaces[0]
    const wsId = workspace.id
    setTokens(accessToken, refreshToken!, wsId)

    const usersRes = await usersApi.list()
    const members = usersRes.data ?? []
    const member = members.find((m) => m.user.id === currentUserId)
    if (!member) return null

    const roleName = getRoleNameFromRole(member.role)
    const user = mapApiUserToAuthUser(member.user, roleName, workspace.plan, workspace.name)
    return { user, onboardingComplete: workspace.onboarding_complete }
  } catch {
    return null
  }
}

async function fetchUserAfterLogin(apiUserId: string): Promise<HydrateResult | null> {
  const { accessToken, setTokens } = useAuthStore.getState()
  if (!accessToken) return null

  try {
    const workspacesRes = await workspaceSwitchApi.listWorkspaces()
    const workspaces = workspacesRes.data
    if (!workspaces?.length) return null

    const workspace = workspaces[0]
    setTokens(accessToken, useAuthStore.getState().refreshToken!, workspace.id)

    const usersRes = await usersApi.list()
    const members = usersRes.data ?? []
    const member = members.find((m) => m.user.id === apiUserId)
    if (!member) return null

    const roleName = getRoleNameFromRole(member.role)
    const user = mapApiUserToAuthUser(member.user, roleName, workspace.plan, workspace.name)
    return { user, onboardingComplete: workspace.onboarding_complete }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  /** After first hydrate; when access/refresh rotate, show loading so route guards don't flash /onboarding. */
  const hasCompletedHydrationCycleRef = useRef(false)

  const { accessToken, refreshToken, clearTokens } = useAuthStore()

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      hasCompletedHydrationCycleRef.current = false
      setUser(null)
      setOnboardingComplete(null)
      setIsLoading(false)
      return
    }

    if (hasCompletedHydrationCycleRef.current) {
      setIsLoading(true)
    }

    let cancelled = false
    hydrateUserFromApi()
      .then((result) => {
        if (cancelled) return
        if (result) {
          setUser(result.user)
          setOnboardingComplete((prev) =>
            prev === true ? true : result.onboardingComplete
          )
          localStorage.setItem(AUTH_KEY, JSON.stringify(result.user))
        } else {
          const stored = localStorage.getItem(AUTH_KEY)
          const { workspaceId } = useAuthStore.getState()
          if (!stored) {
            setUser(null)
            setOnboardingComplete(null)
          } else {
            setUser(JSON.parse(stored))
            if (workspaceId) {
              // Hydrate failed but we have workspaceId — try getMe for onboarding_complete
              workspaceApi.getMe()
                .then((res) => {
                  if (!cancelled) setOnboardingComplete(res.data.onboarding_complete)
                })
                .catch(() => {
                  // Transient errors during token refresh can 401; keep "complete" so we don't bounce to /onboarding
                  if (!cancelled) {
                    setOnboardingComplete((prev) => (prev === true ? true : false))
                  }
                })
            } else {
              setOnboardingComplete((prev) => (prev === true ? true : false))
            }
          }
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
          hasCompletedHydrationCycleRef.current = true
        }
      })

    return () => { cancelled = true }
  }, [accessToken, refreshToken])

  const signup = useCallback(
    async (data: { name: string; email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data: res } = await authApi.signup(data)
        const resAny = res as { access?: string; refresh?: string; user?: { id: string; name: string; email: string }; requires_verification?: boolean }
        if (resAny.requires_verification) {
          return { success: true }
        }
        if (resAny.access && resAny.refresh && resAny.user) {
          useAuthStore.getState().setTokens(resAny.access, resAny.refresh)
          const user = mapApiUserToAuthUserMinimal(resAny.user as ApiUser)
          setUser(user)
          setOnboardingComplete(false)
          localStorage.setItem(AUTH_KEY, JSON.stringify(user))
        }
        return { success: true }
      } catch (err: unknown) {
        const axErr = err as { response?: { data?: { error?: string; message?: string } } }
        const msg =
          axErr.response?.data?.message ?? axErr.response?.data?.error ?? 'Signup failed.'
        if (axErr.response?.data?.error === 'EMAIL_TAKEN') {
          return { success: false, error: 'An account with this email already exists.' }
        }
        return { success: false, error: msg }
      }
    },
    []
  )

  const acceptInvite = useCallback(
    async (token: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data } = await authApi.acceptInvite({ token, name, password })
        useAuthStore.getState().setTokens(data.access, data.refresh)
        const result = await fetchUserAfterLogin(data.user.id)
        if (!result) {
          return { success: false, error: 'Failed to load user data.' }
        }
        setUser(result.user)
        setOnboardingComplete(result.onboardingComplete)
        localStorage.setItem(AUTH_KEY, JSON.stringify(result.user))
        return { success: true }
      } catch (err: unknown) {
        const axErr = err as { response?: { data?: { error?: string; message?: string } } }
        const msg =
          axErr.response?.data?.message ?? axErr.response?.data?.error ?? 'Failed to accept invitation.'
        if (axErr.response?.data?.error === 'INVALID_INVITE') {
          return { success: false, error: 'This invitation link is invalid.' }
        }
        if (axErr.response?.data?.error === 'INVITE_EXPIRED') {
          return { success: false, error: 'This invitation has expired.' }
        }
        return { success: false, error: msg }
      }
    },
    []
  )

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    try {
      const { data } = await authApi.login(email, password)
      useAuthStore.getState().setTokens(data.access, data.refresh)
      const result = await fetchUserAfterLogin(data.user.id)
      if (!result) {
        return { success: false, error: 'Failed to load user data.' }
      }
      if (result.user.isVerified === false) {
        return { success: false, error: 'Please verify your email before logging in.', requiresVerification: true }
      }
      setUser(result.user)
      setOnboardingComplete(result.onboardingComplete)
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.user))
      return { success: true }
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: string; message?: string } } }
      const msg = axErr.response?.data?.message ?? axErr.response?.data?.error ?? 'Invalid email or password.'
      if (axErr.response?.data?.error === 'ACCOUNT_DISABLED') {
        return { success: false, error: 'Your account has been disabled.' }
      }
      if (axErr.response?.data?.error === 'EMAIL_NOT_VERIFIED') {
        return { success: false, error: msg, requiresVerification: true }
      }
      return { success: false, error: msg }
    }
  }, [])

  const logout = useCallback(async () => {
    const { refreshToken } = useAuthStore.getState()
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Ignore logout API errors
    } finally {
      clearTokens()
      localStorage.removeItem(AUTH_KEY)
      setUser(null)
      setOnboardingComplete(null)
      navigateToLogin()
    }
  }, [clearTokens])

  const can = useCallback((permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role as RoleId, permission)
  }, [user])

  const hasPlan = useCallback((feature: Feature): boolean => {
    if (!user) return false
    return hasFeature(user.plan, feature)
  }, [user])

  const planAtLeast = useCallback((plan: PlanId): boolean => {
    if (!user) return false
    return planMeetsMinimum(user.plan, plan)
  }, [user])

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true)
  }, [])

  // Treat as unauthenticated when tokens are cleared (e.g. forceLogout), even before
  // useEffect clears user. Prevents RequireOnboarding from redirecting to /onboarding
  // instead of RequireAuth redirecting to /login.
  const isAuthenticated = !!user && !!accessToken

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        acceptInvite,
        logout,
        completeOnboarding,
        can,
        hasPlan,
        planAtLeast,
        onboardingComplete,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
