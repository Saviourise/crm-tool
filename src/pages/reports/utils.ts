export function formatCurrency(value: number, compact = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function getAttainmentColor(attainment: number): string {
  if (attainment >= 100) return 'text-emerald-600 dark:text-emerald-400'
  if (attainment >= 80)  return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function getAttainmentBarColor(attainment: number): string {
  if (attainment >= 100) return '#10b981'
  if (attainment >= 80)  return '#f59e0b'
  return '#ef4444'
}

export function getProbabilityConfig(probability: number) {
  if (probability >= 75) return {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  }
  if (probability >= 50) return {
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  }
  return {
    className: 'bg-muted text-muted-foreground border-border',
  }
}
