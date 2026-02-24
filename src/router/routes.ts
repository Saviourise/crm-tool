export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CONTACTS: '/contacts',
  LEADS: '/leads',
  PIPELINE: '/pipeline',
  TASKS: '/tasks',
  MARKETING: '/marketing',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]
