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

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your sales pipeline today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
      <div className="grid gap-4 md:grid-cols-2">
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <RecentActivity activities={MOCK_ACTIVITIES} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
