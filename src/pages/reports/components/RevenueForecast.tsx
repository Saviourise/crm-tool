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
import { cn } from '@/lib/utils'
import { FORECAST_DATA, FORECAST_DEALS } from '../data'
import { formatCurrency, formatPercent, getProbabilityConfig } from '../utils'

// ─── Chart config ─────────────────────────────────────────────────────────────

const forecastConfig: ChartConfig = {
  forecast: { label: 'Forecast', color: '#3b82f6' },
  actual: { label: 'Actual', color: '#10b981' },
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const qForecast = 273800
const qTarget = 280000
const coverageRatio = 2.4
const forecastAccuracy = 87.3

const STATS = [
  { label: 'Q1 Forecast', value: formatCurrency(qForecast, true), sub: `vs ${formatCurrency(qTarget, true)} target`, icon: Target, border: 'border-l-blue-500', icon_bg: 'bg-blue-50 dark:bg-blue-950/40', icon_color: 'text-blue-600 dark:text-blue-400' },
  { label: 'Q1 Target', value: formatCurrency(qTarget, true), sub: `${formatPercent((qForecast / qTarget) * 100, 0)} attained`, icon: CheckCircle2, border: 'border-l-emerald-500', icon_bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon_color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Pipeline Coverage', value: `${coverageRatio}x`, sub: 'Target vs open pipeline', icon: Layers, border: 'border-l-violet-500', icon_bg: 'bg-violet-50 dark:bg-violet-950/40', icon_color: 'text-violet-600 dark:text-violet-400' },
  { label: 'Forecast Accuracy', value: formatPercent(forecastAccuracy), sub: 'Actual vs predicted (6 mo.)', icon: TrendingUp, border: 'border-l-amber-500', icon_bg: 'bg-amber-50 dark:bg-amber-950/40', icon_color: 'text-amber-600 dark:text-amber-400' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueForecast() {
  const expectedClose = FORECAST_DEALS.reduce(
    (s, d) => s + d.value * (d.probability / 100), 0
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className={cn('border-l-4', s.border)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">{s.label}</p>
                  <p className="text-xl font-bold tracking-tight mt-0.5">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.sub}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg shrink-0', s.icon_bg)}>
                  <s.icon className={cn('h-5 w-5', s.icon_color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast vs Actual chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Actual vs Forecast Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={forecastConfig} className="h-[200px] w-full sm:h-[280px]">
            <ComposedChart accessibilityLayer data={FORECAST_DATA}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => v !== null ? formatCurrency(Number(v)) : '—'} />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="forecast" fill="var(--color-forecast)" radius={4} opacity={0.7} />
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
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
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
