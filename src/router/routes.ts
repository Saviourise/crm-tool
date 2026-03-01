export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CONTACTS: '/contacts',
  CONTACT_DETAIL: (id: string) => `/contacts/${id}`,
  LEADS: '/leads',
  LEAD_DETAIL: (id: string) => `/leads/${id}`,
  PIPELINE: '/pipeline',
  DEAL_DETAIL: (id: string) => `/pipeline/${id}`,
  COMPANIES: '/companies',
  COMPANY_DETAIL: (id: string) => `/companies/${id}`,
  TASKS: '/tasks',
  CALENDAR: '/calendar',
  COMMUNICATION: '/communication',
  MARKETING: '/marketing',
  REPORTS: '/reports',
  USERS: '/users',
  HELP: '/help',
  SETTINGS: '/settings',
  SETTINGS_BILLING: '/settings?section=billing',
} as const

export type RouteKey = keyof typeof ROUTES
