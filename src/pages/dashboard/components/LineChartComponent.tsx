import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ChartData {
  name: string
  value: number
}

interface LineChartComponentProps {
  title: string
  data: ChartData[]
  chartConfig: ChartConfig
}

export function LineChartComponent({ title, data, chartConfig }: LineChartComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
      </CardContent>
    </Card>
  )
}
