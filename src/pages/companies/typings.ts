export type CompanyStatus = 'active' | 'inactive' | 'prospect'
export type CompanyIndustry =
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Manufacturing'
  | 'Retail'
  | 'Education'
  | 'IT Services'
  | 'Media'

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
}
