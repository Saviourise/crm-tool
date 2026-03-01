import type { Lead, LeadStatus } from './typings'

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

export const calculateLeadScore = (lead: Lead): number => {
  // Placeholder for lead scoring logic
  return lead.score ?? 0
}
