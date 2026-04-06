import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DashboardEmptyState } from './DashboardEmptyState'
import { CHART_CONTAINER_CLASS } from '@/lib/chartLayout'

interface ChartData {
  name: string
  value: number
  /** API month key e.g. 2026-04-01 — tooltip shows a long date */
  isoDate?: string
}

interface LineChartComponentProps {
  title: string
  data: ChartData[]
  chartConfig: ChartConfig
  isLoading?: boolean
  yTickFormatter?: (value: number) => string
  tooltipValueFormatter?: (value: number) => string
}

export function LineChartComponent({
  title,
  data,
  chartConfig,
  isLoading,
  yTickFormatter,
  tooltipValueFormatter,
}: LineChartComponentProps) {
  const isEmpty = !data?.length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={cn(CHART_CONTAINER_CLASS, 'flex items-center justify-center')}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <DashboardEmptyState
            icon={TrendingUp}
            title="No revenue forecast yet"
            description="Revenue forecast will appear here as you add deals to your pipeline."
          />
        ) : (
          <ChartContainer config={chartConfig} className={CHART_CONTAINER_CLASS}>
            <AreaChart accessibilityLayer data={data}>
              <defs>
                <linearGradient id="fillRevenueTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                tickFormatter={yTickFormatter ?? ((v) => String(v))}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, tooltipPayload) => {
                      const row = tooltipPayload?.[0]?.payload as ChartData | undefined
                      if (row?.isoDate) {
                        try {
                          const d = parseISO(row.isoDate)
                          if (!Number.isNaN(d.getTime())) {
                            return format(d, 'MMMM do, yyyy')
                          }
                        } catch {
                          /* fall through */
                        }
                      }
                      return typeof _label === 'string' || typeof _label === 'number'
                        ? String(_label)
                        : ''
                    }}
                    formatter={(value, _name, item, _index, payload) => {
                      const p = payload as unknown as ChartData | undefined
                      const raw = Number(p?.value ?? value)
                      const label =
                        typeof chartConfig.value?.label === 'string'
                          ? chartConfig.value.label
                          : 'Revenue'
                      const display =
                        tooltipValueFormatter && Number.isFinite(raw)
                          ? tooltipValueFormatter(raw)
                          : Number.isFinite(raw)
                            ? raw.toLocaleString()
                            : '—'
                      return (
                        <div className="flex w-full flex-wrap items-center gap-2">
                          <div
                            className="shrink-0 h-2.5 w-2.5 rounded-[2px] border border-solid"
                            style={{
                              backgroundColor: item.color,
                              borderColor: item.color,
                            }}
                          />
                          <div className="flex flex-1 justify-between gap-2 leading-none items-center">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {display}
                            </span>
                          </div>
                        </div>
                      )
                    }}
                  />
                }
                cursor={{ stroke: 'var(--color-value)', strokeWidth: 1 }}
              />
              <Area
                name={
                  typeof chartConfig.value?.label === 'string'
                    ? chartConfig.value.label
                    : 'value'
                }
                dataKey="value"
                type="monotone"
                fill="url(#fillRevenueTrend)"
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
