
export interface Metric {
  id: string
  label: string
  value: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  icon: React.ElementType
}

export interface Activity {
  id: string
  type: 'lead' | 'contact' | 'task' | 'deal'
  title: string
  description: string
  timestamp: string
  user: string
  status?: string
}
