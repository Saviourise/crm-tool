export interface SalesRepMetric {
  id: string
  name: string
  initials: string
  avatarColor: string
  dealsWon: number
  revenue: number
  quota: number
  attainment: number
}

export interface ForecastDeal {
  id: string
  name: string
  company: string
  value: number
  stage: string
  probability: number
  expectedClose: string
  owner: string
}
