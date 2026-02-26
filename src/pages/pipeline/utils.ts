import type { Opportunity } from './typings'

export const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function getTotalPipelineValue(opportunities: Opportunity[]): number {
  return opportunities.reduce((sum, o) => sum + o.value, 0)
}

export function getWeightedPipelineValue(opportunities: Opportunity[]): number {
  return opportunities.reduce((sum, o) => sum + o.value * (o.probability / 100), 0)
}
