/** Maps API feature keys to human-readable labels */
export const FEATURE_LABELS: Record<string, string> = {
  contacts: 'Contact management',
  leads: 'Lead management',
  tasks: 'Task tracking',
  companies: 'Companies management',
  pipeline: 'Pipeline & Kanban',
  calendar: 'Calendar & scheduling',
  communication: 'Communication hub',
  marketing: 'Marketing campaigns',
  reports: 'Analytics & reports',
  'csv-import': 'CSV import / export',
  'multi-pipeline': 'Multi-pipeline support',
  'pipeline-filters': 'Pipeline filters',
  'custom-fields': 'Custom fields',
  'ai-content': 'AI content generator',
  'ai-lead-scoring': 'AI lead scoring',
  'ai-sentiment': 'AI sentiment analysis',
  automation: 'Workflow automation',
  'lead-routing': 'Lead routing rules',
  'audit-log': 'Audit log',
  'ai-suggestions': 'AI next-best-action',
  'ai-video': 'AI video generator',
  'ai-social': 'AI social scheduler',
  'ai-voice': 'AI voice agents',
  'ai-chat': 'AI chat agent',
  sso: 'SSO / SAML',
  privacy: 'Privacy & GDPR tools',
  'all professional features': 'All Professional features',
  'everything in premium': 'Everything in Premium',
  'dedicated support': 'Dedicated support',
  'custom contracts': 'Custom contracts',
}

export function getFeatureLabel(key: string): string {
  return FEATURE_LABELS[key] ?? key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
