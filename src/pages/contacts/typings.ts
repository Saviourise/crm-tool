export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: 'active' | 'inactive' | 'prospect'
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  id: string
  name: string
  industry: string
  size: string
  website?: string
  contactCount: number
  createdAt: Date
}
