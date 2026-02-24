export interface Metric {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

export interface Activity {
  id: string
  type: 'lead' | 'contact' | 'task' | 'deal'
  title: string
  description: string
  timestamp: Date
  user: string
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: () => void
}
