import { api } from '@/lib/api'
import type { ApiPricingPlan, BillingOverview, CheckoutResponse } from './types'

/** Public — no auth required */
export const pricingApi = {
  getPlans: () => api.get<ApiPricingPlan[]>('/api/pricing/'),
}

/** Requires auth + X-Workspace-ID */
export const billingApi = {
  getOverview: () => api.get<BillingOverview>('/api/settings/billing/'),
  checkout: (plan: string, billing_cycle: 'monthly' | 'yearly') =>
    api.post<CheckoutResponse>('/api/settings/billing/checkout/', { plan, billing_cycle }),
  cancel: () => api.post<{ message: string; current_period_end: string }>('/api/settings/billing/cancel/'),
  getInvoices: () =>
    api.get<Array<{
      id: string
      amount_paid: number
      currency: string
      status: string
      invoice_pdf: string | null
      period_start: number
      period_end: number
      created: number
    }>>('/api/settings/billing/invoices/'),
}
