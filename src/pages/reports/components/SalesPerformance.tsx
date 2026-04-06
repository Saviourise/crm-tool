import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { DollarSign, TrendingUp, Target, Trophy, BarChart2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { CHART_CONTAINER_CLASS } from '@/lib/chartLayout'
import { MONTHLY_REVENUE, WON_LOST_DATA, SALES_REPS } from '../data'
import { formatCurrency, formatPercent, getAttainmentColor, getAttainmentBarColor } from '../utils'

// ─── Chart configs ────────────────────────────────────────────────────────────

const revenueConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--success)' },
}

const wonLostConfig: ChartConfig = {
  won: { label: 'Won', color: 'var(--success)' },
  lost: { label: 'Lost', color: 'var(--danger)' },
}

// ─── Stat cards ───────────────────────────────────────────────────────────────

const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0)
const currentMonthRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue
const totalDeals = SALES_REPS.reduce((s, r) => s + r.dealsWon, 0)
const avgDealSize = totalRevenue / totalDeals
const winRate = 63.2
const avgAttainment = SALES_REPS.reduce((s, r) => s + r.attainment, 0) / SALES_REPS.length

const STATS: {
  label: string
  value: string
  sub: string
  icon: typeof DollarSign
  accent: StatCardAccent
}[] = [
  { label: 'Revenue (6 mo.)', value: formatCurrency(totalRevenue, true), sub: '+18% vs prior period', icon: DollarSign, accent: 'success' },
  { label: 'This Month', value: formatCurrency(currentMonthRevenue, true), sub: '+9.2% vs last month', icon: TrendingUp, accent: 'primary' },
  { label: 'Avg Deal Size', value: formatCurrency(avgDealSize, true), sub: `${totalDeals} deals total`, icon: BarChart2, accent: 'secondary' },
  { label: 'Win Rate', value: formatPercent(winRate), sub: 'Qualified → Closed', icon: Trophy, accent: 'warning' },
  { label: 'Quota Attainment', value: formatPercent(avgAttainment), sub: 'Team average', icon: Target, accent: 'destructive' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesPerformance() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className={CHART_CONTAINER_CLASS}>
              <BarChart accessibilityLayer data={MONTHLY_REVENUE}>
                <defs>
                  <linearGradient id="fillReportRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />}
                  cursor={{ fill: 'var(--muted)', opacity: 0.25 }}
                />
                <Bar dataKey="revenue" fill="url(#fillReportRevenue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Won vs Lost */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Won vs Lost Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={wonLostConfig} className={CHART_CONTAINER_CLASS}>
              <BarChart accessibilityLayer data={WON_LOST_DATA} barGap={4}>
                <defs>
                  <linearGradient id="fillReportWon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-won)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-won)" stopOpacity={0.95} />
                  </linearGradient>
                  <linearGradient id="fillReportLost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-lost)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-lost)" stopOpacity={0.92} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--muted)', opacity: 0.25 }} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="won" fill="url(#fillReportWon)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" fill="url(#fillReportLost)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales rep table */}
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b border-border/50 px-6 pb-3 pt-6">
          <CardTitle className="text-sm font-semibold">Sales Rep Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rep</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deals</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quota</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-48">Attainment</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {SALES_REPS.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0', rep.avatarColor)}>
                          {rep.initials}
                        </div>
                        <span className="font-medium">{rep.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{rep.dealsWon}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{formatCurrency(rep.revenue, true)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(rep.quota, true)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(rep.attainment, 100)}%`,
                              background: getAttainmentBarColor(rep.attainment),
                            }}
                          />
                        </div>
                        <span className={cn('text-xs font-semibold tabular-nums w-14 text-right', getAttainmentColor(rep.attainment))}>
                          {formatPercent(rep.attainment)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
