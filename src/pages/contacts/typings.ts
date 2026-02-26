export type ContactStatus = 'active' | 'inactive' | 'prospect'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: ContactStatus
  tags: string[]
  avatar?: string
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

export type SortField = 'name' | 'email' | 'company' | 'status' | 'lastContacted' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface ContactFilters {
  search: string
  status: ContactStatus | 'all'
  sortField: SortField
  sortDirection: SortDirection
}
