import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { Users, UserCheck, ArrowRightLeft, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { LEAD_FUNNEL, LEAD_SOURCES, LEAD_TREND } from '../data'
import { formatPercent } from '../utils'

// ─── Chart configs ────────────────────────────────────────────────────────────

const funnelConfig: ChartConfig = {
  count: { label: 'Leads', color: 'hsl(var(--primary))' },
}

const trendConfig: ChartConfig = {
  leads: { label: 'New Leads', color: '#8b5cf6' },
}

const SOURCE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#94a3b8']

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Leads (Q1)',    value: '347',               sub: '+23% vs Q4',            icon: Users,          border: 'border-l-blue-500',    icon_bg: 'bg-blue-50 dark:bg-blue-950/40',       icon_color: 'text-blue-600 dark:text-blue-400' },
  { label: 'Qualified Rate',      value: formatPercent(40.9), sub: '142 of 347 leads',       icon: UserCheck,      border: 'border-l-emerald-500', icon_bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon_color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Conversion Rate',     value: formatPercent(9.8),  sub: 'Lead → Closed Won',      icon: ArrowRightLeft, border: 'border-l-violet-500',  icon_bg: 'bg-violet-50 dark:bg-violet-950/40',   icon_color: 'text-violet-600 dark:text-violet-400' },
  { label: 'Avg Response Time',   value: '2.4h',              sub: 'First contact after MQL', icon: Clock,          border: 'border-l-amber-500',   icon_bg: 'bg-amber-50 dark:bg-amber-950/40',     icon_color: 'text-amber-600 dark:text-amber-400' },
  { label: 'MQL → SQL Rate',      value: formatPercent(62.0), sub: '88 of 142 qualified',    icon: Zap,            border: 'border-l-rose-500',    icon_bg: 'bg-rose-50 dark:bg-rose-950/40',       icon_color: 'text-rose-600 dark:text-rose-400' },
]

// ─── Custom pie label ─────────────────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.07) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeadAnalytics() {
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

      {/* Funnel + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 [&>*]:min-w-0">
        {/* Lead funnel — horizontal bar */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="h-[200px] w-full sm:h-[260px]">
              <BarChart
                accessibilityLayer
                data={LEAD_FUNNEL}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" width={72} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Lead sources — donut */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="h-[200px] w-full sm:h-[260px]">
              <PieChart>
                <Pie
                  data={LEAD_SOURCES}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                >
                  {LEAD_SOURCES.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lead volume trend */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Lead Volume Trend (Last 8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendConfig} className="h-[180px] w-full sm:h-[220px]">
            <AreaChart accessibilityLayer data={LEAD_TREND}>
              <defs>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-leads)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: 'var(--color-leads)', strokeWidth: 1 }} />
              <Area
                dataKey="leads"
                type="monotone"
                fill="url(#fillLeads)"
                fillOpacity={1}
                stroke="var(--color-leads)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
