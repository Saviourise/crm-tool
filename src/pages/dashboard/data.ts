import type { ChartConfig } from '@/components/ui/chart'

/** Chart configs (no mock data - data comes from API) */
export const PIPELINE_CHART_CONFIG: ChartConfig = {
  value: {
    label: 'Leads',
    color: 'oklch(0.65 0.18 150)', // Success green
  },
}

export const REVENUE_CHART_CONFIG: ChartConfig = {
  value: {
    label: 'Revenue (K)',
    color: 'oklch(0.58 0.22 245)', // Primary blue
  },
}
