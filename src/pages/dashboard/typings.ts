import { LucideIcon } from 'lucide-react'

export interface Metric {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  icon: LucideIcon
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
