// Marketing utility functions
export const calculateOpenRate = (opened: number, sent: number): number => {
  if (sent === 0) return 0
  return (opened / sent) * 100
}

export const calculateClickRate = (clicked: number, opened: number): number => {
  if (opened === 0) return 0
  return (clicked / opened) * 100
}

export const calculateConversionRate = (converted: number, sent: number): number => {
  if (sent === 0) return 0
  return (converted / sent) * 100
}
