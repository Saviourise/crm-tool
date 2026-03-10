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

/** Free plan: 201 with tokens. Paid plan: 202 with requires_payment + checkout_url */
export type OnboardingCompleteResponse =
  | { access: string; refresh: string; workspace: { id: string; provision_status: string } }
  | { requires_payment: true; checkout_url: string }

export interface OnboardingStatusResponse {
  provision_status: 'pending_payment' | 'provisioning' | 'active' | 'failed'
  workspace: ApiWorkspace | null
}

export interface RefreshResponse {
  access: string
  refresh: string
}

/** Pricing plan from GET /api/pricing/ (stripe_price_id_* removed in 2026-03-10-2) */
export interface ApiPricingPlan {
  key: string
  name: string
  price_monthly: number | null
  price_yearly: number | null
  ai_credits: number
  seats: number
  features: string[]
  popular: boolean
}

/** Billing overview from GET /api/settings/billing/ */
export interface BillingOverview {
  plan: string
  subscription_status: 'inactive' | 'active' | 'trialing' | 'past_due' | 'canceled'
  current_period_end: string | null
  billing_email: string | null
  stripe_customer_id: string | null
  ai_credits_total: number
  ai_credits_used: number
  ai_credits_remaining: number
}

/** Checkout response from POST /api/settings/billing/checkout/ */
export interface CheckoutResponse {
  checkout_url: string
}

/** Chat session (AI chat). Use workspace_id — workspace_slug was removed in 2026-03-09 migration. */
export interface ApiChatSession extends WorkspaceScopedResource {
  id: string
  workspace_id: string
  title?: string
  created_at: string
  updated_at?: string
}
