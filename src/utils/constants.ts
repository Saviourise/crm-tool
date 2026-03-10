// App configuration constants
export const APP_NAME = 'CRM Tool'
export const APP_VERSION = '1.0.0'

// API configuration (placeholders for future implementation)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_TIMEOUT = 30000

// Feature flags
export const FEATURES = {
  AI_ASSISTANT: true,
  EMAIL_MARKETING: true,
  TELEPHONY: false,
  ADVANCED_ANALYTICS: true,
  CUSTOM_FIELDS: true,
} as const

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 25
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm'
export const TIME_FORMAT = 'HH:mm'

// Currency
export const DEFAULT_CURRENCY = 'USD'
export const CURRENCY_SYMBOL = '$'

// Validation
export const MIN_PASSWORD_LENGTH = 8
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'crm-ui-theme',
  SIDEBAR_STATE: 'crm-sidebar-state',
  USER_PREFERENCES: 'crm-user-preferences',
  AUTH_TOKENS: 'crm-auth-tokens',
  AUTH_USER: 'crm_auth_user',
} as const

// Routes (re-export from router for convenience)
export { ROUTES } from '@/router/routes'
