import { useLocation, useNavigate } from 'react-router-dom'
import { Users, UserPlus, CheckSquare, Sparkles } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { CreateLeadDialog } from '@/components/common/CreateLeadDialog'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { ROUTES } from '@/router/routes'

export default function Dashboard() {
  const { can, hasPlan } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const fromOnboarding = (location.state as { fromOnboarding?: boolean })?.fromOnboarding

  const hasQuickActions =
    can('leads.create') ||
    can('contacts.create') ||
    can('tasks.create') ||
    (can('marketing.send') && hasPlan('marketing')) ||
    (can('reports.view') && hasPlan('reports'))

  if (fromOnboarding) {
    return (
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto pt-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Your workspace is ready</h1>
          <p className="text-muted-foreground mt-2">
            Start by adding your first contact or lead. You can always explore the rest of the app from the sidebar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          {can('contacts.create') && (
            <AddContactDialog
              trigger={
                <Button size="lg" className="gap-2">
                  <Users className="h-4 w-4" />
                  Add your first contact
                </Button>
              }
            />
          )}
          {can('leads.create') && (
            <CreateLeadDialog
              trigger={
                <Button variant="outline" size="lg" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create your first lead
                </Button>
              }
            />
          )}
          {can('tasks.create') && (
            <NewTaskDialog
              trigger={
                <Button variant="outline" size="lg" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Create a task
                </Button>
              }
            />
          )}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => navigate(ROUTES.DASHBOARD, { replace: true, state: {} })}
          >
            Skip and explore dashboard
          </Button>
        </div>
      </div>
    )
  }

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
