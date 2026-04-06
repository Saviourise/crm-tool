import { format } from 'date-fns'
import type { ApiDeal, ApiPipeline, ApiSavedView } from '@/api/pipeline'
import type { Opportunity, Pipeline, SavedView, Stage, PipelineFilters } from './typings'

// API stage → frontend Stage
export const API_TO_FRONTEND_STAGE: Record<string, Stage> = {
  lead: 'prospecting',
  qualified: 'qualification',
  proposal: 'proposal',
  negotiation: 'negotiation',
  won: 'closed-won',
  lost: 'closed-lost',
}

// Frontend Stage → API stage
export const FRONTEND_TO_API_STAGE: Record<Stage, string> = {
  prospecting: 'lead',
  qualification: 'qualified',
  proposal: 'proposal',
  negotiation: 'negotiation',
  'closed-won': 'won',
  'closed-lost': 'lost',
}

function resolveName(value: string | { id: string; name: string } | null | undefined): string {
  if (!value) return '—'
  if (typeof value === 'object') return value.name
  return value
}

function resolveId(value: string | { id: string; name: string } | null | undefined): string | undefined {
  if (!value) return undefined
  if (typeof value === 'object') return value.id
  // plain string could be a UUID — return it
  return value
}

export function mapApiDealToOpportunity(api: ApiDeal): Opportunity {
  const stage: Stage = API_TO_FRONTEND_STAGE[api.stage] ?? 'prospecting'

  let expectedCloseDate = ''
  let expectedCloseDateIso: string | undefined
  if (api.expected_close_date) {
    const ymd = api.expected_close_date.split('T')[0]
    expectedCloseDateIso = /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : undefined
    try {
      expectedCloseDate = format(new Date(api.expected_close_date), 'MMM d, yyyy')
    } catch {
      expectedCloseDate = api.expected_close_date
    }
  }

  return {
    id: api.id,
    name: api.name,
    company: resolveName(api.company),
    companyId: resolveId(api.company),
    contact: resolveName(api.contact),
    contactId: resolveId(api.contact),
    value: parseFloat(api.value) || 0,
    stage,
    probability: api.probability ?? 0,
    expectedCloseDate,
    expectedCloseDateIso,
    assignedTo: resolveName(api.assigned_to),
    assignedToId: resolveId(api.assigned_to),
    pipelineId: resolveId(api.pipeline),
    notes: api.notes ?? undefined,
    createdAt: api.created_at,
  }
}

export function mapApiPipelineToPipeline(api: ApiPipeline, dealCount = 0): Pipeline {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    dealCount,
    totalValue: parseFloat(api.total_value ?? '0') || 0,
    isDefault: api.is_default,
    createdAt: api.created_at,
  }
}

export function mapApiSavedViewToSavedView(api: ApiSavedView): SavedView {
  const f = (api.filters ?? {}) as Partial<Record<string, unknown>>
  const filters: PipelineFilters = {
    assignedTo: f.assignedTo != null ? String(f.assignedTo) : '',
    minValue: f.minValue != null ? String(f.minValue) : '',
    maxValue: f.maxValue != null ? String(f.maxValue) : '',
    closeDateFrom: f.closeDateFrom != null ? String(f.closeDateFrom) : '',
    closeDateTo: f.closeDateTo != null ? String(f.closeDateTo) : '',
    minProbability: f.minProbability != null ? Number(f.minProbability) : 0,
  }
  return { id: api.id, name: api.name, filters }
}
