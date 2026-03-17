export type CompanyStatus = 'active' | 'inactive' | 'prospect' | 'customer'
export type CompanyIndustry =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'retail'
  | 'manufacturing'
  | 'education'
  | 'real_estate'
  | 'consulting'
  | 'other'

export interface Company {
  id: string
  name: string
  industry: CompanyIndustry
  website: string
  employees: number
  annualRevenue: number
  contactCount: number
  openDeals: number
  status: CompanyStatus
  owner: string
  createdAt: string
  phone?: string
  address?: string
}
