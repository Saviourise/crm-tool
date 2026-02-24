import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
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
  fill?: string
}

interface BarChartComponentProps {
  title: string
  data: ChartData[]
  chartConfig: ChartConfig
}

export function BarChartComponent({ title, data, chartConfig }: BarChartComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
      </CardContent>
    </Card>
  )
}
