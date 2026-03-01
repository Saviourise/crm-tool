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
import { cn } from '@/lib/utils'
import { MONTHLY_REVENUE, WON_LOST_DATA, SALES_REPS } from '../data'
import { formatCurrency, formatPercent, getAttainmentColor, getAttainmentBarColor } from '../utils'

// ─── Chart configs ────────────────────────────────────────────────────────────

const revenueConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#10b981' },
}

const wonLostConfig: ChartConfig = {
  won:  { label: 'Won',  color: '#10b981' },
  lost: { label: 'Lost', color: '#ef4444' },
}

// ─── Stat cards ───────────────────────────────────────────────────────────────

const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0)
const currentMonthRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue
const totalDeals = SALES_REPS.reduce((s, r) => s + r.dealsWon, 0)
const avgDealSize = totalRevenue / totalDeals
const winRate = 63.2
const avgAttainment = SALES_REPS.reduce((s, r) => s + r.attainment, 0) / SALES_REPS.length

const STATS = [
  { label: 'Revenue (6 mo.)',  value: formatCurrency(totalRevenue, true),    sub: '+18% vs prior period', icon: DollarSign, border: 'border-l-emerald-500', icon_bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon_color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'This Month',       value: formatCurrency(currentMonthRevenue, true), sub: '+9.2% vs last month', icon: TrendingUp, border: 'border-l-blue-500',   icon_bg: 'bg-blue-50 dark:bg-blue-950/40',       icon_color: 'text-blue-600 dark:text-blue-400' },
  { label: 'Avg Deal Size',    value: formatCurrency(avgDealSize, true),       sub: `${totalDeals} deals total`,   icon: BarChart2,  border: 'border-l-violet-500', icon_bg: 'bg-violet-50 dark:bg-violet-950/40',   icon_color: 'text-violet-600 dark:text-violet-400' },
  { label: 'Win Rate',         value: formatPercent(winRate),                  sub: 'Qualified → Closed',          icon: Trophy,     border: 'border-l-amber-500',  icon_bg: 'bg-amber-50 dark:bg-amber-950/40',     icon_color: 'text-amber-600 dark:text-amber-400' },
  { label: 'Quota Attainment', value: formatPercent(avgAttainment),            sub: 'Team average',                icon: Target,     border: 'border-l-rose-500',   icon_bg: 'bg-rose-50 dark:bg-rose-950/40',       icon_color: 'text-rose-600 dark:text-rose-400' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesPerformance() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[260px] w-full">
              <BarChart accessibilityLayer data={MONTHLY_REVENUE}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Won vs Lost */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Won vs Lost Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={wonLostConfig} className="h-[260px] w-full">
              <BarChart accessibilityLayer data={WON_LOST_DATA} barGap={4}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="won"  fill="var(--color-won)"  radius={4} />
                <Bar dataKey="lost" fill="var(--color-lost)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales rep table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Sales Rep Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
