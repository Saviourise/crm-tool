import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { Users, UserCheck, ArrowRightLeft, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { StatCard, type StatCardAccent } from '@/components/common/StatCard'
import { CHART_CONTAINER_CLASS } from '@/lib/chartLayout'
import { LEAD_FUNNEL, LEAD_SOURCES, LEAD_TREND } from '../data'
import { formatPercent } from '../utils'

// ─── Chart configs ────────────────────────────────────────────────────────────

const funnelConfig: ChartConfig = {
  count: { label: 'Leads', color: 'var(--primary)' },
}

const trendConfig: ChartConfig = {
  leads: { label: 'New Leads', color: 'var(--primary)' },
}

const SOURCE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#94a3b8']

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS: {
  label: string
  value: string
  sub: string
  icon: typeof Users
  accent: StatCardAccent
}[] = [
  { label: 'Total Leads (Q1)', value: '347', sub: '+23% vs Q4', icon: Users, accent: 'primary' },
  { label: 'Qualified Rate', value: formatPercent(40.9), sub: '142 of 347 leads', icon: UserCheck, accent: 'success' },
  { label: 'Conversion Rate', value: formatPercent(9.8), sub: 'Lead → Closed Won', icon: ArrowRightLeft, accent: 'secondary' },
  { label: 'Avg Response Time', value: '2.4h', sub: 'First contact after MQL', icon: Clock, accent: 'warning' },
  { label: 'MQL → SQL Rate', value: formatPercent(62.0), sub: '88 of 142 qualified', icon: Zap, accent: 'destructive' },
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

      {/* Funnel + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 [&>*]:min-w-0">
        {/* Lead funnel — horizontal bar */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className={CHART_CONTAINER_CLASS}>
              <BarChart
                accessibilityLayer
                data={LEAD_FUNNEL}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <defs>
                  <linearGradient id="fillFunnelBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-count)" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" width={72} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--muted)', opacity: 0.25 }} />
                <Bar dataKey="count" fill="url(#fillFunnelBar)" radius={[0, 4, 4, 0]} />
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
            <ChartContainer config={funnelConfig} className={CHART_CONTAINER_CLASS}>
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
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 12px 40px rgb(0 0 0 / 0.12)',
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
          <ChartContainer config={trendConfig} className={CHART_CONTAINER_CLASS}>
            <AreaChart accessibilityLayer data={LEAD_TREND}>
              <defs>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-leads)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-leads)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
