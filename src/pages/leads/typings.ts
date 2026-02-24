export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
export type LeadSource = 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other'

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  status: LeadStatus
  source: LeadSource
  score?: number
  assignedTo?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
