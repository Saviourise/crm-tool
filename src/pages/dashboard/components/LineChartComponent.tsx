import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
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
}

interface LineChartComponentProps {
  title: string
  data: ChartData[]
  chartConfig: ChartConfig
  isLoading?: boolean
}

export function LineChartComponent({ title, data, chartConfig, isLoading }: LineChartComponentProps) {
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
            icon={TrendingUp}
            title="No revenue forecast yet"
            description="Revenue forecast will appear here as you add deals to your pipeline."
          />
        ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full sm:h-[300px]">
          <AreaChart accessibilityLayer data={data}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: 'var(--color-value)', strokeWidth: 1 }} />
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillRevenue)"
              fillOpacity={1}
              stroke="var(--color-value)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
