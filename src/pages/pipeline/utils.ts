import { Opportunity, Stage } from './typings'

// Pipeline utility functions
export const calculateWeightedValue = (value: number, probability: number): number => {
  return value * (probability / 100)
}

export const getStageColor = (stage: Stage): string => {
  const colors = {
    prospecting: 'gray',
    qualification: 'blue',
    proposal: 'purple',
    negotiation: 'orange',
    'closed-won': 'green',
    'closed-lost': 'red',
  }
  return colors[stage]
}

export const getTotalPipelineValue = (opportunities: Opportunity[]): number => {
  return opportunities.reduce((sum, opp) => sum + opp.value, 0)
}
