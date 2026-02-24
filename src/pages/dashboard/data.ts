import { Metric, Activity } from './typings'
import { UserPlus, Users, TrendingUp, DollarSign, CheckSquare } from 'lucide-react'

export const MOCK_METRICS: Metric[] = [
  {
    id: '1',
    label: 'Total Leads',
    value: '2,847',
    change: '+12%',
    trend: 'up',
    color: 'blue',
    icon: UserPlus,
  },
  {
    id: '2',
    label: 'Active Contacts',
    value: '8,234',
    change: '+17%',
    trend: 'up',
    color: 'green',
    icon: Users,
  },
  {
    id: '3',
    label: 'Open Opportunities',
    value: '156',
    change: '+8%',
    trend: 'up',
    color: 'orange',
    icon: TrendingUp,
  },
  {
    id: '4',
    label: 'Deals Closed',
    value: '$124.3K',
    change: '-6%',
    trend: 'down',
    color: 'purple',
    icon: DollarSign,
  },
  {
    id: '5',
    label: 'Tasks Due',
    value: '42',
    change: '+24%',
    trend: 'up',
    color: 'red',
    icon: CheckSquare,
  },
]

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New lead captured',
    description: 'Acme Corp submitted contact form for Enterprise plan',
    timestamp: '5 minutes ago',
    user: 'Sarah Miller',
    status: 'New',
  },
  {
    id: '2',
    type: 'contact',
    title: 'Contact updated',
    description: 'Mike Johnson updated media library with new product photos',
    timestamp: '18 minutes ago',
    user: 'Mike Johnson',
  },
  {
    id: '3',
    type: 'deal',
    title: 'Deal moved to negotiation',
    description: 'TechStart Inc. opportunity advanced to negotiation stage',
    timestamp: '2 hours ago',
    user: 'Emma Davis',
    status: 'Negotiation',
  },
  {
    id: '4',
    type: 'task',
    title: 'Follow-up call scheduled',
    description: 'Reminder set for demo call with Global Systems tomorrow',
    timestamp: '3 hours ago',
    user: 'David Wilson',
  },
  {
    id: '5',
    type: 'contact',
    title: 'Contact engagement',
    description: 'Jessica Lee opened email campaign and clicked 3 links',
    timestamp: '5 hours ago',
    user: 'Emma Davis',
  },
]

export const LEAD_PIPELINE_DATA = [
  { name: 'New', value: 145 },
  { name: 'Contacted', value: 98 },
  { name: 'Qualified', value: 67 },
  { name: 'Proposal', value: 43 },
  { name: 'Negotiation', value: 28 },
]

export const REVENUE_TREND_DATA = [
  { name: 'Jan', value: 85 },
  { name: 'Feb', value: 92 },
  { name: 'Mar', value: 78 },
  { name: 'Apr', value: 105 },
  { name: 'May', value: 98 },
  { name: 'Jun', value: 124 },
]

export const PIPELINE_CHART_CONFIG = {
  value: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
} satisfies import('@/components/ui/chart').ChartConfig

export const REVENUE_CHART_CONFIG = {
  value: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
} satisfies import('@/components/ui/chart').ChartConfig
