/**
 * API response types from docs/API_INTEGRATION.md
 *
 * Migration 2026-03-09: Schema-per-tenant → shared schema (workspace_id FK).
 * - ChatSession: workspace_slug removed → use workspace_id
 * - Many serializers now include read-only workspace_id in responses
 */

/** Base for resources that belong to a workspace (many serializers now include workspace_id) */
export interface WorkspaceScopedResource {
  workspace_id?: string
}

export interface ApiUser {
  id: string
  email: string
  name: string
  job_title: string | null
  phone: string | null
  avatar_url: string | null
  avatar_color: string | null
  initials: string | null
  timezone: string
  language: string
  is_active: boolean
  is_verified?: boolean
  created_at: string
}

export interface ApiWorkspace {
  id: string
  name: string
  slug: string
  plan: 'free' | 'basic' | 'professional' | 'premium' | 'enterprise'
  ai_credits_total: number
  ai_credits_used: number
  ai_credits_remaining: number
  is_active: boolean
  onboarding_complete: boolean
  website: string
  logo_url: string
  timezone: string
  date_format: string
  created_at: string
}

export interface ApiRole {
  id: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
  color: string | null
  created_at: string
  member_count?: number
}

export interface ApiWorkspaceMember {
  id: string
  user: ApiUser
  role: ApiRole
  status: string
  joined_at: string
  last_login: string | null
  is_active: boolean
}

export interface ApiError {
  error?: string
  message?: string
  detail?: Record<string, unknown>
}

export interface LoginResponse {
  access: string
  refresh: string
  user: ApiUser
}

export interface SignupResponse {
  access: string
  refresh: string
  user: ApiUser
}

export interface OnboardingStartResponse {
  onboarding_token: string
  completed_steps?: string[]
  workspace_name?: string
  workspace_slug?: string
  job_title?: string
  goals?: string[]
  pending_invites?: Array<{ email: string; role_name: string }>
  selected_plan?: string
  expires_at?: string
}

export interface OnboardingSlugCheckResponse {
  slug: string
  available: boolean
}

export interface OnboardingCompleteResponse {
  access: string
  refresh: string
  workspace: { id: string; provision_status: 'provisioning' | 'active' | 'failed' }
}

export interface OnboardingStatusResponse {
  provision_status: 'provisioning' | 'active' | 'failed'
  workspace: ApiWorkspace | null
}

export interface RefreshResponse {
  access: string
  refresh: string
}

/** Chat session (AI chat). Use workspace_id — workspace_slug was removed in 2026-03-09 migration. */
export interface ApiChatSession extends WorkspaceScopedResource {
  id: string
  workspace_id: string
  title?: string
  created_at: string
  updated_at?: string
}
