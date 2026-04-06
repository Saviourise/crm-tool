import type { ChartConfig } from '@/components/ui/chart'

/** Chart configs (no mock data - data comes from API) */
export const PIPELINE_CHART_CONFIG: ChartConfig = {
  value: {
    label: 'Leads',
    color: 'oklch(0.65 0.18 150)', // Success green
  },
}

/** Matches reports Lead Volume Trend (`var(--primary)` area + stroke) */
export const REVENUE_CHART_CONFIG: ChartConfig = {
  value: {
    label: 'Revenue',
    color: 'var(--primary)',
  },
}
