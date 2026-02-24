import { Opportunity, Forecast, Stage } from './typings'

export const MOCK_OPPORTUNITIES: Opportunity[] = []

export const MOCK_FORECAST: Forecast[] = []

export const PIPELINE_STAGES: { value: Stage; label: string; probability: number }[] = [
  { value: 'prospecting', label: 'Prospecting', probability: 10 },
  { value: 'qualification', label: 'Qualification', probability: 25 },
  { value: 'proposal', label: 'Proposal', probability: 50 },
  { value: 'negotiation', label: 'Negotiation', probability: 75 },
  { value: 'closed-won', label: 'Closed Won', probability: 100 },
  { value: 'closed-lost', label: 'Closed Lost', probability: 0 },
]
