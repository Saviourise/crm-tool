import { formatDistanceToNow } from 'date-fns'
import type { ApiLead } from '@/api/leads'
import type { Lead, LeadSource, LeadStatus } from './typings'

// The model SOURCE_CHOICES use the same values as the UI: website, referral, social, email, phone, event, other
const VALID_SOURCES = new Set<LeadSource>(['website', 'referral', 'social', 'email', 'phone', 'event', 'other'])

/** Maps form/select values to API `source` field (same keys as backend). */
export const SOURCE_UI_TO_API: Record<LeadSource, string> = {
  website: 'website',
  referral: 'referral',
  social: 'social',
  email: 'email',
  phone: 'phone',
  event: 'event',
  other: 'other',
}

export function mapApiLeadToLead(apiLead: ApiLead): Lead {
  const lastActivity = apiLead.last_activity
    ? formatDistanceToNow(new Date(apiLead.last_activity), { addSuffix: true })
    : undefined

  const validStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']
  const status = validStatuses.includes(apiLead.status as LeadStatus)
    ? (apiLead.status as LeadStatus)
    : 'new'

  const source: LeadSource = VALID_SOURCES.has(apiLead.source as LeadSource)
    ? (apiLead.source as LeadSource)
    : 'other'

  const company =
    typeof apiLead.company === 'object' && apiLead.company && 'name' in apiLead.company
      ? apiLead.company.name
      : typeof apiLead.company === 'string'
        ? apiLead.company
        : undefined

  const companyId =
    typeof apiLead.company === 'object' && apiLead.company && 'id' in apiLead.company
      ? apiLead.company.id
      : undefined

  return {
    id: apiLead.id,
    firstName: apiLead.first_name,
    lastName: apiLead.last_name,
    email: apiLead.email,
    phone: apiLead.phone ?? undefined,
    company,
    companyId,
    position: apiLead.position ?? undefined,
    status,
    source,
    score: apiLead.score ?? 0,
    value: apiLead.value ? parseFloat(apiLead.value) : undefined,
    assignedTo: typeof apiLead.assigned_to === 'object' && apiLead.assigned_to ? apiLead.assigned_to.name : undefined,
    assignedToId: typeof apiLead.assigned_to === 'object' && apiLead.assigned_to ? apiLead.assigned_to.id : undefined,
    notes: apiLead.notes ?? undefined,
    lastActivity,
    createdAt: apiLead.created_at,
  }
}
