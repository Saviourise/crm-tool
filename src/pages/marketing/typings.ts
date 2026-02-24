export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
export type CampaignType = 'email' | 'sms' | 'social' | 'multi-channel'

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  targetAudience: string
  startDate?: Date
  endDate?: Date
  metrics: {
    sent: number
    opened: number
    clicked: number
    converted: number
  }
  createdAt: Date
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
  createdAt: Date
}

export interface AIContent {
  id: string
  type: 'email' | 'social' | 'ad-copy'
  prompt: string
  generatedContent: string
  createdAt: Date
}
