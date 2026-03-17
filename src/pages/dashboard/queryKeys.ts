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
