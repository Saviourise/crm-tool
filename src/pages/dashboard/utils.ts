// Dashboard utility functions
export const formatMetricValue = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function mapActivityType(entityType: string): 'lead' | 'contact' | 'task' | 'deal' | 'company' {
  const t = entityType?.toLowerCase() ?? ''
  switch (t) {
    case 'lead':
    case 'leads':
      return 'lead'
    case 'contact':
    case 'contacts':
      return 'contact'
    case 'task':
    case 'tasks':
      return 'task'
    case 'deal':
    case 'deals':
    case 'pipeline':
    case 'pipelines':
      return 'deal'
    case 'company':
    case 'companies':
      return 'company'
    default:
      return 'lead'
  }
}

export function mapActivityTitle(type: string, entityType: string): string {
  const t = type?.toLowerCase() ?? ''
  const e = entityType?.toLowerCase() ?? ''
  if (t === 'create') {
    if (e === 'lead' || e === 'leads') return 'New lead captured'
    if (e === 'contact' || e === 'contacts') return 'Contact added'
    if (e === 'deal' || e === 'deals' || e === 'pipeline' || e === 'pipelines') return 'Deal created'
    if (e === 'task' || e === 'tasks') return 'Task created'
    if (e === 'company' || e === 'companies') return 'Company created'
  }
  if (t === 'call' || t === 'calls') return 'Call logged'
  if (t === 'email' || t === 'emails') return 'Email sent'
  if (t === 'meeting' || t === 'meetings') return 'Meeting scheduled'
  return `${entityType || 'Activity'} updated`
}