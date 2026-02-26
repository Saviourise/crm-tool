export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
export type CampaignType = 'email' | 'sms' | 'social' | 'multi-channel'
export type TemplateCategory = 'welcome' | 'nurture' | 'promotional' | 'follow-up' | 'newsletter' | 're-engagement'
export type AIContentType = 'email' | 'social' | 'ad-copy'

export interface CampaignMetrics {
  sent: number
  opened: number
  clicked: number
  converted: number
}

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  targetAudience: string
  startDate?: string
  endDate?: string
  metrics: CampaignMetrics
  createdAt: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  preview: string
  category: TemplateCategory
  usageCount: number
  createdAt: string
}

export interface AIGeneration {
  id: string
  type: AIContentType
  tone: string
  prompt: string
  output: string
  createdAt: string
}
