import type { SalesRepMetric, ForecastDeal } from './typings'

// ─── Sales Performance ────────────────────────────────────────────────────────

export const MONTHLY_REVENUE = [
  { month: 'Sep', revenue: 64200 },
  { month: 'Oct', revenue: 78900 },
  { month: 'Nov', revenue: 72100 },
  { month: 'Dec', revenue: 91300 },
  { month: 'Jan', revenue: 84600 },
  { month: 'Feb', revenue: 92400 },
]

export const WON_LOST_DATA = [
  { month: 'Sep', won: 8, lost: 5 },
  { month: 'Oct', won: 11, lost: 4 },
  { month: 'Nov', won: 9, lost: 6 },
  { month: 'Dec', won: 13, lost: 3 },
  { month: 'Jan', won: 10, lost: 5 },
  { month: 'Feb', won: 14, lost: 4 },
]

export const SALES_REPS: SalesRepMetric[] = [
  { id: 'r1', name: 'Emma Torres',  initials: 'ET', avatarColor: 'bg-rose-500',    dealsWon: 16, revenue: 168200, quota: 150000, attainment: 112.1 },
  { id: 'r2', name: 'Sarah Kim',    initials: 'SK', avatarColor: 'bg-violet-500',  dealsWon: 11, revenue: 118300, quota: 120000, attainment: 98.6  },
  { id: 'r3', name: 'Alex Rivera',  initials: 'AR', avatarColor: 'bg-blue-500',    dealsWon: 14, revenue: 142400, quota: 150000, attainment: 94.9  },
  { id: 'r4', name: 'James Obi',    initials: 'JO', avatarColor: 'bg-emerald-500', dealsWon: 8,  revenue: 98100,  quota: 110000, attainment: 89.2  },
  { id: 'r5', name: 'David Park',   initials: 'DP', avatarColor: 'bg-amber-500',   dealsWon: 6,  revenue: 62400,  quota: 90000,  attainment: 69.3  },
]

// ─── Lead Analytics ───────────────────────────────────────────────────────────

export const LEAD_FUNNEL = [
  { stage: 'Won',         count: 34  },
  { stage: 'Negotiation', count: 54  },
  { stage: 'Proposal',    count: 89  },
  { stage: 'Qualified',   count: 142 },
  { stage: 'Contacted',   count: 218 },
  { stage: 'New',         count: 347 },
]

export const LEAD_SOURCES = [
  { name: 'Website',       value: 28 },
  { name: 'Referral',      value: 22 },
  { name: 'LinkedIn',      value: 18 },
  { name: 'Cold Outreach', value: 15 },
  { name: 'Events',        value: 10 },
  { name: 'Other',         value: 7  },
]

export const LEAD_TREND = [
  { week: 'Wk 1', leads: 42 },
  { week: 'Wk 2', leads: 38 },
  { week: 'Wk 3', leads: 51 },
  { week: 'Wk 4', leads: 46 },
  { week: 'Wk 5', leads: 58 },
  { week: 'Wk 6', leads: 44 },
  { week: 'Wk 7', leads: 62 },
  { week: 'Wk 8', leads: 54 },
]

// ─── Revenue Forecast ─────────────────────────────────────────────────────────

export const FORECAST_DATA = [
  { month: 'Sep', actual: 64200,  forecast: 68000  },
  { month: 'Oct', actual: 78900,  forecast: 75000  },
  { month: 'Nov', actual: 72100,  forecast: 76000  },
  { month: 'Dec', actual: 91300,  forecast: 88000  },
  { month: 'Jan', actual: 84600,  forecast: 82000  },
  { month: 'Feb', actual: 92400,  forecast: 90000  },
  { month: 'Mar', actual: null,   forecast: 96800  },
  { month: 'Apr', actual: null,   forecast: 102000 },
]

export const FORECAST_DEALS: ForecastDeal[] = [
  { id: 'fd1', name: 'Enterprise Platform License', company: 'GreenLeaf Ventures', value: 48000, stage: 'Negotiation', probability: 85, expectedClose: 'Mar 14', owner: 'Alex Rivera' },
  { id: 'fd2', name: 'Compliance Suite',            company: 'FinEdge Solutions',   value: 22000, stage: 'Negotiation', probability: 80, expectedClose: 'Mar 7',  owner: 'Alex Rivera' },
  { id: 'fd3', name: 'Business Plan (12 seats)',    company: 'BlueStar Retail',      value: 18600, stage: 'Demo',        probability: 55, expectedClose: 'Mar 20', owner: 'James Obi'   },
  { id: 'fd4', name: 'Team Edition (8 users)',      company: 'Apex Technologies',    value: 9360,  stage: 'Proposal',    probability: 65, expectedClose: 'Mar 25', owner: 'Sarah Kim'   },
  { id: 'fd5', name: 'Pro Plan Annual',             company: 'Cloudify Inc.',        value: 4700,  stage: 'Proposal',    probability: 70, expectedClose: 'Mar 10', owner: 'Alex Rivera' },
  { id: 'fd6', name: 'Starter (5 seats)',           company: 'HorizonAI',            value: 2940,  stage: 'Evaluation',  probability: 40, expectedClose: 'Mar 31', owner: 'Emma Torres' },
]
