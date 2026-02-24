import { LeadStatus } from './typings'

// Lead utility functions
export const getLeadStatusColor = (status: LeadStatus): string => {
  const colors = {
    new: 'blue',
    contacted: 'purple',
    qualified: 'green',
    unqualified: 'red',
    converted: 'green',
  }
  return colors[status]
}

export const calculateLeadScore = (lead: any): number => {
  // Placeholder for lead scoring logic
  return 0
}
