export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other'

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  companyId?: string
  position?: string
  status: LeadStatus
  source: LeadSource
  score: number
  value?: number
  assignedTo?: string
  notes?: string
  lastActivity?: string
  createdAt: string
}
