import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DashboardEmptyState } from './DashboardEmptyState'

interface ChartData {
  name: string
  value: number
  fill?: string
}

interface BarChartComponentProps {
  title: string
  data: ChartData[]
  chartConfig: ChartConfig
  isLoading?: boolean
}

export function BarChartComponent({ title, data, chartConfig, isLoading }: BarChartComponentProps) {
  const isEmpty = !data?.length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] sm:h-[300px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <DashboardEmptyState
            icon={BarChart3}
            title="No lead data yet"
            description="Lead pipeline data will appear here as you add and qualify leads."
          />
        ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full sm:h-[300px]">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="value" fill="var(--color-value)" radius={8} />
          </BarChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
