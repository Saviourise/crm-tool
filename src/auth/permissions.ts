import type { RoleId, Permission, Feature, PlanId } from './types'
import { PLAN_ORDER } from './types'

// ─── RBAC ────────────────────────────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete', 'contacts.import', 'contacts.export',
  'companies.view', 'companies.create', 'companies.edit', 'companies.delete', 'companies.import', 'companies.export',
  'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.import', 'leads.export', 'leads.convert',
  'pipeline.view', 'pipeline.create', 'pipeline.edit', 'pipeline.delete',
  'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
  'calendar.view', 'calendar.create', 'calendar.edit', 'calendar.delete',
  'communication.view', 'communication.create',
  'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete', 'marketing.send',
  'reports.view', 'reports.export',
  'users.view', 'users.invite', 'users.edit', 'users.delete',
  'settings.view', 'settings.profile', 'settings.team', 'settings.billing',
  'settings.integrations', 'settings.security', 'settings.custom-fields',
  'settings.automation', 'settings.lead-routing', 'settings.audit-log', 'settings.privacy',
]

const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  'super-admin': [...ALL_PERMISSIONS],
  'admin': ALL_PERMISSIONS.filter(p => !['settings.billing'].includes(p) ? true : false),
  'manager': [
    'dashboard.view',
    'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete', 'contacts.import', 'contacts.export',
    'companies.view', 'companies.create', 'companies.edit', 'companies.import', 'companies.export',
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.import', 'leads.export', 'leads.convert',
    'pipeline.view', 'pipeline.create', 'pipeline.edit', 'pipeline.delete',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
    'calendar.view', 'calendar.create', 'calendar.edit', 'calendar.delete',
    'communication.view', 'communication.create',
    'marketing.view', 'marketing.create', 'marketing.edit',
    'reports.view', 'reports.export',
    'users.view', 'users.invite',
    'settings.view', 'settings.profile', 'settings.team',
  ],
  'sales-rep': [
    'dashboard.view',
    'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.import',
    'companies.view', 'companies.export',
    'leads.view', 'leads.create', 'leads.edit', 'leads.export', 'leads.convert',
    'pipeline.view', 'pipeline.create', 'pipeline.edit',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
    'calendar.view', 'calendar.create', 'calendar.edit',
    'communication.view', 'communication.create',
    'reports.view',
    'settings.view', 'settings.profile',
  ],
  'marketing': [
    'dashboard.view',
    'contacts.view', 'contacts.export',
    'companies.view', 'companies.export',
    'leads.view',
    'pipeline.view',
    'tasks.view', 'tasks.create', 'tasks.edit',
    'calendar.view', 'calendar.create',
    'communication.view',
    'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete', 'marketing.send',
    'reports.view', 'reports.export',
    'settings.view', 'settings.profile',
  ],
  'viewer': [
    'dashboard.view',
    'contacts.view',
    'companies.view', 'companies.export',
    'leads.view',
    'pipeline.view',
    'tasks.view',
    'calendar.view',
    'communication.view',
    'reports.view',
    'settings.view', 'settings.profile',
  ],
}

export function hasPermission(role: RoleId, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getRolePermissions(role: RoleId): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

// ─── Plan Feature Flags ───────────────────────────────────────────────────────

const PLAN_FEATURES: Record<PlanId, Feature[]> = {
  free: [],
  basic: ['companies', 'pipeline', 'calendar', 'communication', 'csv-import'],
  professional: [
    'companies', 'pipeline', 'calendar', 'communication', 'csv-import',
    'marketing', 'reports', 'multi-pipeline', 'pipeline-filters',
    'custom-fields', 'ai-content', 'ai-sentiment', 'ai-lead-scoring',
  ],
  premium: [
    'companies', 'pipeline', 'calendar', 'communication', 'csv-import',
    'marketing', 'reports', 'multi-pipeline', 'pipeline-filters',
    'custom-fields', 'ai-content', 'ai-sentiment', 'ai-lead-scoring',
    'ai-social', 'ai-voice', 'ai-chat', 'ai-suggestions',
    'automation', 'lead-routing', 'audit-log',
  ],
  enterprise: [
    'companies', 'pipeline', 'calendar', 'communication', 'csv-import',
    'marketing', 'reports', 'multi-pipeline', 'pipeline-filters',
    'custom-fields', 'ai-content', 'ai-sentiment', 'ai-lead-scoring',
    'ai-social', 'ai-voice', 'ai-chat', 'ai-suggestions',
    'automation', 'lead-routing', 'audit-log', 'sso', 'privacy',
  ],
}

export function hasFeature(plan: PlanId, feature: Feature): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false
}

export function planMeetsMinimum(userPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan)
}
