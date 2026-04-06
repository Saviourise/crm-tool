import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, } from 'recharts'
import { Target, TrendingUp, Layers, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { StatCard, type StatCardAccent } from '@/components/common/StatCard'
import { CHART_CONTAINER_CLASS } from '@/lib/chartLayout'
import { cn } from '@/lib/utils'
import { FORECAST_DATA, FORECAST_DEALS } from '../data'
import { formatCurrency, formatPercent, getProbabilityConfig } from '../utils'

// ─── Chart config ─────────────────────────────────────────────────────────────

const forecastConfig: ChartConfig = {
  forecast: { label: 'Forecast', color: 'var(--primary)' },
  actual: { label: 'Actual', color: 'var(--success)' },
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const qForecast = 273800
const qTarget = 280000
const coverageRatio = 2.4
const forecastAccuracy = 87.3

const STATS: {
  label: string
  value: string
  sub: string
  icon: typeof Target
  accent: StatCardAccent
}[] = [
  { label: 'Q1 Forecast', value: formatCurrency(qForecast, true), sub: `vs ${formatCurrency(qTarget, true)} target`, icon: Target, accent: 'primary' },
  { label: 'Q1 Target', value: formatCurrency(qTarget, true), sub: `${formatPercent((qForecast / qTarget) * 100, 0)} attained`, icon: CheckCircle2, accent: 'success' },
  { label: 'Pipeline Coverage', value: `${coverageRatio}x`, sub: 'Target vs open pipeline', icon: Layers, accent: 'secondary' },
  { label: 'Forecast Accuracy', value: formatPercent(forecastAccuracy), sub: 'Actual vs predicted (6 mo.)', icon: TrendingUp, accent: 'warning' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueForecast() {
  const expectedClose = FORECAST_DEALS.reduce(
    (s, d) => s + d.value * (d.probability / 100), 0
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            value={s.value}
            label={s.label}
            sub={s.sub}
            accent={s.accent}
          />
        ))}
      </div>

      {/* Forecast vs Actual chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Actual vs Forecast Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={forecastConfig} className={CHART_CONTAINER_CLASS}>
            <ComposedChart accessibilityLayer data={FORECAST_DATA}>
              <defs>
                <linearGradient id="fillForecastBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-forecast)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-forecast)" stopOpacity={0.88} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => v !== null ? formatCurrency(Number(v)) : '—'} />}
                cursor={{ fill: 'var(--muted)', opacity: 0.25 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="forecast" fill="url(#fillForecastBar)" radius={[4, 4, 0, 0]} />
              <Line
                dataKey="actual"
                type="monotone"
                stroke="var(--color-actual)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-actual)', r: 4 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pipeline deals table */}
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/50 px-6 pb-3 pt-6">
          <CardTitle className="text-sm font-semibold">Pipeline — Expected Close This Quarter</CardTitle>
          <div className="text-xs text-muted-foreground">
            Expected value: <span className="font-semibold text-foreground">{formatCurrency(expectedClose, true)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Probability</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expected</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Close Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {FORECAST_DEALS.map((deal) => {
                  const probCfg = getProbabilityConfig(deal.probability)
                  const expectedValue = deal.value * (deal.probability / 100)
                  return (
                    <tr key={deal.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3">
                        <p className="font-medium">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">{deal.company}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatCurrency(deal.value, true)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">{deal.stage}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="outline" className={cn('text-xs', probCfg.className)}>
                          {deal.probability}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground text-xs">
                        {formatCurrency(expectedValue, true)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{deal.expectedClose}</td>
                      <td className="px-4 py-3 text-xs">{deal.owner}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
