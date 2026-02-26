export type Stage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'

export interface Opportunity {
  id: string
  name: string
  company: string
  contact: string
  value: number
  stage: Stage
  probability: number
  expectedCloseDate: string
  assignedTo: string
  notes?: string
  createdAt: string
}

export type PipelineView = 'kanban' | 'list'
