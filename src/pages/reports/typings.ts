export type ReportType = 'sales' | 'marketing' | 'activity' | 'forecast' | 'custom'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'funnel'

export interface Report {
  id: string
  name: string
  type: ReportType
  description: string
  dateRange: {
    start: Date
    end: Date
  }
  createdBy: string
  createdAt: Date
}

export interface Widget {
  id: string
  type: ChartType
  title: string
  data: any[]
  config: ChartConfig
}

export interface ChartConfig {
  xAxis?: string
  yAxis?: string
  colors?: string[]
  legend?: boolean
  grid?: boolean
}
