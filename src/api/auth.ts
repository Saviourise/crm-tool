import { api } from '@/lib/api'
import type {
  LoginResponse,
  SignupResponse,
  RefreshResponse,
  ApiWorkspace,
  ApiWorkspaceMember,
  OnboardingStartResponse,
  OnboardingSlugCheckResponse,
  OnboardingCompleteResponse,
  OnboardingStatusResponse,
} from './types'

/** Public auth endpoints - no Authorization header needed */
const publicApi = api

export const authApi = {
  login: (email: string, password: string) =>
    publicApi.post<LoginResponse>('/api/auth/login/', { email, password }),

  signup: (data: { name: string; email: string; password: string }) =>
    publicApi.post<SignupResponse>('/api/auth/signup/', data),

  logout: (refresh: string) =>
    api.post('/api/auth/logout/', { refresh }),

  logoutAll: () =>
    api.post<{ message: string }>('/api/auth/logout/all/'),

  refreshToken: (refresh: string) =>
    publicApi.post<RefreshResponse>('/api/auth/token/refresh/', { refresh }),

  forgotPassword: (email: string) =>
    publicApi.post<{ message: string }>('/api/auth/forgot-password/', { email }),

  /** Verifies email with OTP sent during signup. Returns tokens on success. */
  verifyEmail: (email: string, otp: string) =>
    publicApi.post<LoginResponse>('/api/auth/verify-email/', { email, otp }),

  /** Verifies OTP for forgot-password flow (no tokens returned). */
  verifyOtp: (email: string, otp: string) =>
    publicApi.post<{ message: string }>('/api/auth/verify-otp/', { email, otp }),

  resendSignupOtp: (email: string) =>
    publicApi.post<{ message: string }>('/api/auth/signup/resend-otp/', { email }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    publicApi.post<{ message: string }>('/api/auth/reset-password/', {
      email,
      otp,
      new_password,
    }),

  acceptInvite: (data: { token: string; name: string; password: string }) =>
    publicApi.post<LoginResponse>('/api/auth/invites/accept/', data),
}

/** Requires Bearer token but NOT X-Workspace-ID */
export const workspaceSwitchApi = {
  listWorkspaces: () =>
    api.get<ApiWorkspace[]>('/api/workspaces/switch/'),
}

/** Requires Bearer + X-Workspace-ID */
export const workspaceApi = {
  getMe: () =>
    api.get<ApiWorkspace>('/api/workspaces/me/'),

  update: (data: Partial<{ name: string; website: string; logo_url: string; timezone: string; date_format: string; onboarding_complete: boolean }>) =>
    api.patch<ApiWorkspace>('/api/workspaces/me/', data),
}

export const usersApi = {
  list: () =>
    api.get<ApiWorkspaceMember[]>('/api/users/'),
}

/** Onboarding API — uses X-Onboarding-Token (set via api interceptor from onboardingStore) */
export const onboardingApi = {
  start: () =>
    api.post<OnboardingStartResponse>('/api/onboarding/start/'),

  slugCheck: (slug: string) =>
    api.get<OnboardingSlugCheckResponse>(`/api/onboarding/slug-check/?slug=${encodeURIComponent(slug)}`),

  updateWorkspace: (data: { workspace_name: string; workspace_slug: string }) =>
    api.patch('/api/onboarding/workspace/', data),

  updateRole: (data: { job_title?: string; goals?: string[] }) =>
    api.patch('/api/onboarding/role/', data),

  sendInvites: (data: { invites: Array<{ email: string; role_name: string }> }) =>
    api.post('/api/onboarding/invites/', data),

  updatePlan: (data: { selected_plan: string }) =>
    api.patch('/api/onboarding/plan/', data),

  complete: () =>
    api.post<OnboardingCompleteResponse>('/api/onboarding/complete/'),

  status: () =>
    api.get<OnboardingStatusResponse>('/api/onboarding/status/'),
}
