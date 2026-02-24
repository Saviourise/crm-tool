// Dashboard utility functions
export const formatMetricValue = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
