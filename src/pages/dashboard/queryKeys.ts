import type { QueryClient } from '@tanstack/react-query'

/** Dashboard query keys for precise invalidation */

export const DASHBOARD_PERIOD = '30d'

export const dashboardQueryKeys = {
  salesPerformance: ['dashboard', 'sales-performance', DASHBOARD_PERIOD] as const,
  leadAnalytics: ['dashboard', 'lead-analytics', DASHBOARD_PERIOD] as const,
  revenueForecast: ['dashboard', 'revenue-forecast'] as const,
  activity: ['dashboard', 'activity'] as const,
  contactsCount: ['dashboard', 'contacts-count'] as const,
  tasksDue: ['dashboard', 'tasks-due'] as const,
}

/**
 * Sales performance (GET /api/reports/sales-performance/) backs **Deals Closed** (sum of `stage_distribution`
 * rows with `stage === "won"`, via `getClosedWonValue`) and **Open Opportunities**
 * (`total_deals - won_deals - lost_deals`). Revenue forecast is GET /api/reports/revenue-forecast/.
 * Call this after pipeline/deal mutations so the dashboard stays in sync.
 */
export function invalidateDashboardPipelineMetrics(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales-performance'], exact: false })
  queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.revenueForecast })
}
