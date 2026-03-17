import type { ApiCompany } from '@/api/companies'
import type { Company, CompanyIndustry, CompanyStatus } from './typings'

export function mapApiCompanyToCompany(api: ApiCompany): Company {
  const status = (api.status as CompanyStatus) || 'prospect'
  const industry = (api.industry as CompanyIndustry) || 'other'

  return {
    id: api.id,
    name: api.name,
    industry,
    website: api.website ?? '',
    employees: api.employees ?? 0,
    annualRevenue: api.annual_revenue ?? 0,
    contactCount: api.contacts_count ?? 0,
    openDeals: api.deals_count ?? 0,
    status,
    owner: (typeof api.owner === 'object' && api.owner?.name) ? api.owner.name : '—',
    createdAt: api.created_at ?? '',
    phone: api.phone ?? undefined,
    address: api.address ?? undefined,
  }
}
