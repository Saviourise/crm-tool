export type Stage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'

export interface Opportunity {
  id: string
  name: string
  company: string
  value: number
  stage: Stage
  probability: number
  expectedCloseDate: Date
  assignedTo: string
  contactId: string
  createdAt: Date
  updatedAt: Date
}

export interface Forecast {
  stage: Stage
  totalValue: number
  count: number
  weightedValue: number
}
