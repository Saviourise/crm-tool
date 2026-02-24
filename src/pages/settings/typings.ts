export type UserRole = 'owner' | 'admin' | 'manager' | 'sales' | 'support'

export interface UserSettings {
  id: string
  userId: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
  }
}

export interface Integration {
  id: string
  name: string
  type: 'email' | 'calendar' | 'telephony' | 'marketing' | 'analytics'
  status: 'connected' | 'disconnected' | 'error'
  config: Record<string, any>
}

export interface Subscription {
  id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: Date
  features: string[]
}
