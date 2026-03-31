export type ContactStatus = 'active' | 'inactive' | 'prospect'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  companyId?: string
  position?: string
  status: ContactStatus
  tags: string[]
  avatar?: string
  assignedTo?: string
  assignedToId?: string
  linkedin?: string
  twitter?: string
  lastContacted?: string
  createdAt: string
}

export interface Company {
  id: string
  name: string
  industry: string
  size: string
  website?: string
  contactCount: number
  createdAt: string
}

