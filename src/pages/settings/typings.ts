export type SettingsSection =
  | 'profile'
  | 'password'
  | 'notifications'
  | 'team'
  | 'billing'
  | 'integrations'
  | 'security'
  | 'custom-fields'
  | 'automation'
  | 'lead-routing'
  | 'audit-log'
  | 'privacy'

export type BillingCycle = 'monthly' | 'yearly'
export type PlanId = 'free' | 'basic' | 'professional' | 'premium' | 'enterprise'
export type IntegrationStatus = 'connected' | 'disconnected'
export type SessionDevice = 'desktop' | 'mobile' | 'tablet'
export type NotificationKey =
  | 'newLead'
  | 'dealStage'
  | 'taskDue'
  | 'taskOverdue'
  | 'mention'
  | 'campaignLaunched'
  | 'reportReady'
  | 'newContact'

export type NotificationPrefs = Record<NotificationKey, { email: boolean; inApp: boolean }>

export interface ProfileData {
  name: string
  email: string
  phone: string
  jobTitle: string
  timezone: string
  language: string
  avatarColor: string
  initials: string
}

export interface TeamData {
  orgName: string
  website: string
  defaultRole: string
  timezone: string
  dateFormat: string
}

export interface Plan {
  id: PlanId
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  users: string
  contacts: string
  emails: string
  features: string[]
  aiFeatures: string[]
  highlighted?: boolean
  isCurrent: boolean
}

export interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
}

export interface PaymentMethod {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export interface Integration {
  id: string
  name: string
  description: string
  category: string
  status: IntegrationStatus
  iconName: string
  connectedAccount?: string
}

export interface Session {
  id: string
  device: SessionDevice
  browser: string
  location: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed: string
  scopes: string[]
}

// ─── Custom Fields ─────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'boolean' | 'phone' | 'email'
export type FieldEntity = 'contacts' | 'leads' | 'deals' | 'tasks'

export interface CustomField {
  id: string
  label: string
  type: FieldType
  entity: FieldEntity
  required: boolean
  options?: string[]
}

// ─── Automation ────────────────────────────────────────────────────────────────

export type AutomationTrigger =
  | 'lead-created'
  | 'deal-stage-changed'
  | 'task-overdue'
  | 'contact-tag-added'
  | 'form-submitted'

export type AutomationActionType =
  | 'send-email'
  | 'create-task'
  | 'assign-user'
  | 'add-tag'
  | 'move-deal-stage'
  | 'send-notification'

export interface AutomationCondition {
  field: string
  operator: string
  value: string
}

export interface AutomationAction {
  type: AutomationActionType
}

export interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  enabled: boolean
  executionsThisMonth: number
  successRate: number
}

// ─── Lead Routing ──────────────────────────────────────────────────────────────

export type RoutingMethod = 'round-robin' | 'territory' | 'score'

export interface RoutingMember {
  id: string
  name: string
  active: boolean
}

export interface TerritoryRule {
  id: string
  field: string
  operator: string
  value: string
  assignedTo: string
}

export interface ScoreTier {
  id: string
  minScore: number
  assignTo: string
}

export interface LeadRoutingConfig {
  method: RoutingMethod
  members: RoutingMember[]
  territoryRules: TerritoryRule[]
  scoreTiers: ScoreTier[]
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────

export type AuditAction = 'created' | 'updated' | 'deleted' | 'login' | 'export' | 'settings-change'

export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  userInitials: string
  action: AuditAction
  entityType: string
  entityName: string
  ip: string
  details: string
}

// ─── Privacy ───────────────────────────────────────────────────────────────────

export type ErasureStatus = 'pending' | 'processing' | 'completed'

export interface ErasureRequest {
  id: string
  email: string
  dateSubmitted: string
  status: ErasureStatus
}

export interface PrivacySettings {
  dataRetention: {
    contacts: string
    leads: string
    deals: string
  }
  cookieConsent: {
    analytics: boolean
    marketing: boolean
  }
  erasureRequests: ErasureRequest[]
}
