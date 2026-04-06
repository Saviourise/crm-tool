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
import { CHART_CONTAINER_CLASS } from '@/lib/chartLayout'
import { cn } from '@/lib/utils'

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
          <div className={cn(CHART_CONTAINER_CLASS, 'flex items-center justify-center')}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <DashboardEmptyState
            icon={BarChart3}
            title="No lead data yet"
            description="Lead pipeline data will appear here as you add and qualify leads."
          />
        ) : (
        <ChartContainer config={chartConfig} className={CHART_CONTAINER_CLASS}>
          <BarChart accessibilityLayer data={data}>
            <defs>
              <linearGradient id="fillDashboardBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.92} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              className="text-xs"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
            />
            <Bar dataKey="value" fill="url(#fillDashboardBar)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
