export type PlanId = 'free' | 'basic' | 'professional' | 'premium' | 'enterprise'
export type RoleId = 'super-admin' | 'admin' | 'manager' | 'sales-rep' | 'marketing' | 'viewer'

export const PLAN_ORDER: PlanId[] = ['free', 'basic', 'professional', 'premium', 'enterprise']

export interface DemoUser {
  id: string
  name: string
  email: string
  password: string  // plain text for demo
  role: RoleId
  plan: PlanId
  company: string
  avatarColor: string
  initials: string
  jobTitle: string
  inviteToken?: string  // for testing invite flow
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: RoleId
  plan: PlanId
  company: string
  avatarColor: string
  initials: string
  jobTitle: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}

export type Permission =
  | 'dashboard.view'
  | 'contacts.view' | 'contacts.create' | 'contacts.edit' | 'contacts.delete' | 'contacts.import' | 'contacts.export'
  | 'companies.view' | 'companies.create' | 'companies.edit' | 'companies.delete'
  | 'leads.view' | 'leads.create' | 'leads.edit' | 'leads.delete' | 'leads.import' | 'leads.convert'
  | 'pipeline.view' | 'pipeline.create' | 'pipeline.edit' | 'pipeline.delete'
  | 'tasks.view' | 'tasks.create' | 'tasks.edit' | 'tasks.delete'
  | 'calendar.view' | 'calendar.create' | 'calendar.edit' | 'calendar.delete'
  | 'communication.view' | 'communication.create'
  | 'marketing.view' | 'marketing.create' | 'marketing.edit' | 'marketing.delete' | 'marketing.send'
  | 'reports.view' | 'reports.export'
  | 'users.view' | 'users.invite' | 'users.edit' | 'users.delete'
  | 'settings.view'
  | 'settings.profile'
  | 'settings.team'
  | 'settings.billing'
  | 'settings.integrations'
  | 'settings.security'
  | 'settings.custom-fields'
  | 'settings.automation'
  | 'settings.lead-routing'
  | 'settings.audit-log'
  | 'settings.privacy'

export type Feature =
  | 'companies'
  | 'pipeline'
  | 'calendar'
  | 'communication'
  | 'marketing'
  | 'reports'
  | 'csv-import'
  | 'multi-pipeline'
  | 'pipeline-filters'
  | 'custom-fields'
  | 'ai-content'
  | 'ai-sentiment'
  | 'ai-lead-scoring'
  | 'ai-social'
  | 'ai-voice'
  | 'ai-chat'
  | 'ai-suggestions'
  | 'automation'
  | 'lead-routing'
  | 'audit-log'
  | 'sso'
  | 'privacy'
