import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { forceLogout } from '@/lib/authLogout'

/**
 * Axios instance for API requests.
 * - Base URL from env (VITE_API_BASE_URL)
 * - Request interceptor: adds Authorization + X-Workspace-ID only for non-public endpoints
 * - Response interceptor: 401 → refresh token → retry; refresh fail → force logout
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise
  const { refreshToken, setTokens } = useAuthStore.getState()
  if (!refreshToken) {
    forceLogout()
    throw new Error('No refresh token')
  }
  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<{ access: string; refresh: string }>(
        `${API_BASE_URL}/api/auth/token/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )
      setTokens(data.access, data.refresh)
      return data.access
    } catch {
      forceLogout()
      throw new Error('Token refresh failed')
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

const PUBLIC_PATHS = [
  '/api/auth/login/',
  '/api/auth/signup/',
  '/api/auth/forgot-password/',
  '/api/auth/verify-email/',
  '/api/auth/verify-otp/',
  '/api/auth/reset-password/',
  '/api/auth/invites/accept/',
  '/api/auth/token/refresh/',
  '/api/pricing/',
  '/api/settings/billing/webhook/',
]

/** Endpoints that need Authorization but NOT X-Workspace-ID */
const NO_WORKSPACE_PATHS = ['/api/workspaces/switch/', '/api/onboarding/']

function isPublicRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  return PUBLIC_PATHS.some((path) => url.includes(path))
}

function isOnboardingRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  return url.includes('/api/onboarding/')
}

function isOnboardingStartRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  return url.includes('/api/onboarding/start')
}

function isNoWorkspaceRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  return NO_WORKSPACE_PATHS.some((path) => url.includes(path))
}

api.interceptors.request.use((config) => {
  if (isPublicRequest(config)) return config

  const { accessToken, workspaceId } = useAuthStore.getState()
  const { onboardingToken } = useOnboardingStore.getState()

  if (isOnboardingRequest(config)) {
    if (isOnboardingStartRequest(config)) {
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    } else if (onboardingToken) {
      config.headers['X-Onboarding-Token'] = onboardingToken
    }
    return config
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (workspaceId && !isNoWorkspaceRequest(config)) {
    config.headers['X-Workspace-ID'] = workspaceId
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Don't try refresh for public endpoints — 401 means auth failed, not expired token
    if (isPublicRequest(originalRequest)) return Promise.reject(error)
    // Onboarding (non-start) uses X-Onboarding-Token, not Bearer — 401 = invalid onboarding token
    if (isOnboardingRequest(originalRequest) && !isOnboardingStartRequest(originalRequest)) return Promise.reject(error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccess = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
