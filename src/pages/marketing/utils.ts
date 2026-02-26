import type { CampaignMetrics } from './typings'

export function getOpenRate(metrics: CampaignMetrics): number {
  if (metrics.sent === 0) return 0
  return Math.round((metrics.opened / metrics.sent) * 100)
}

export function getClickRate(metrics: CampaignMetrics): number {
  if (metrics.opened === 0) return 0
  return Math.round((metrics.clicked / metrics.opened) * 100)
}

export function getConversionRate(metrics: CampaignMetrics): number {
  if (metrics.clicked === 0) return 0
  return Math.round((metrics.converted / metrics.clicked) * 100)
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
