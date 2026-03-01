import { MetricCard } from './components/MetricCard'
import { QuickActions } from './components/QuickActions'
import { RecentActivity } from './components/RecentActivity'
import { BarChartComponent } from './components/PerformanceChart'
import { LineChartComponent } from './components/LineChartComponent'
import {
  MOCK_METRICS,
  MOCK_ACTIVITIES,
  LEAD_PIPELINE_DATA,
  REVENUE_TREND_DATA,
  PIPELINE_CHART_CONFIG,
  REVENUE_CHART_CONFIG,
} from './data'
import { useAuth } from '@/auth/context'

export default function Dashboard() {
  const { can, hasPlan } = useAuth()

  const hasQuickActions =
    can('leads.create') ||
    can('contacts.create') ||
    can('tasks.create') ||
    (can('marketing.send') && hasPlan('marketing')) ||
    (can('reports.view') && hasPlan('reports'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening with your sales pipeline today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {MOCK_METRICS.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <BarChartComponent
          title="Lead Pipeline Funnel"
          data={LEAD_PIPELINE_DATA}
          chartConfig={PIPELINE_CHART_CONFIG}
        />
        <LineChartComponent
          title="Revenue Trend (Last 6 Months)"
          data={REVENUE_TREND_DATA}
          chartConfig={REVENUE_CHART_CONFIG}
        />
      </div>

      {/* Bottom Row: Activity + Quick Actions */}
      <div className={hasQuickActions ? 'grid gap-4 md:grid-cols-3' : undefined}>
        <div className={hasQuickActions ? 'md:col-span-2' : undefined}>
          <RecentActivity activities={MOCK_ACTIVITIES} />
        </div>
        {hasQuickActions && (
          <div>
            <QuickActions />
          </div>
        )}
      </div>
    </div>
  )
}
