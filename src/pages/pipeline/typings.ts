export type Stage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'

export type StageColor = 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'amber' | 'gray'

export interface ColorConfig {
  dot: string
  textColor: string
  bgColor: string
  cardBorderClass: string
  columnBgClass: string
  badgeClass: string
}

export interface StageSettings {
  stage: Stage
  visible: boolean
  label: string
  color: StageColor
}

export interface CardFieldSettings {
  value: boolean
  probability: boolean
  closeDate: boolean
  assignee: boolean
  company: boolean
}

export interface BoardConfig {
  stages: StageSettings[]
  cardFields: CardFieldSettings
  columnWidth: number
}

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
