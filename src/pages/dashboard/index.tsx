import { useLocation, useNavigate } from 'react-router-dom'
import { Users, UserPlus, CheckSquare, Sparkles, TrendingUp, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { MetricCard } from './components/MetricCard'
import { QuickActions } from './components/QuickActions'
import { RecentActivity } from './components/RecentActivity'
import { BarChartComponent } from './components/PerformanceChart'
import { LineChartComponent } from './components/LineChartComponent'
import { PIPELINE_CHART_CONFIG, REVENUE_CHART_CONFIG } from './data'
import { useAuth } from '@/auth/context'
import { Button } from '@/components/ui/button'
import { CreateLeadDialog } from '@/components/common/CreateLeadDialog'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { ROUTES } from '@/router/routes'
import { dashboardApi, getClosedWonValue } from '@/api/dashboard'
import { contactsApi } from '@/api/contacts'
import { dashboardQueryKeys, DASHBOARD_PERIOD } from './queryKeys'
import type { Metric } from './typings'
import { mapActivityType, mapActivityTitle } from './utils'
import type { ActivityRow } from '../activity/components/ActivityTable'

function formatCurrency(value: string): string {
  const num = parseFloat(value)
  if (Number.isNaN(num) || num < 0) return '$0'
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`
  return `$${num.toFixed(0)}`
}



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

  const { data: salesData, isLoading: salesLoading, isFetching: salesFetching } = useQuery({
    queryKey: dashboardQueryKeys.salesPerformance,
    queryFn: () => dashboardApi.salesPerformance(DASHBOARD_PERIOD as '7d' | '30d' | '90d' | '1y'),
  })

  const { data: leadData, isLoading: leadsLoading, isFetching: leadsFetching } = useQuery({
    queryKey: dashboardQueryKeys.leadAnalytics,
    queryFn: () => dashboardApi.leadAnalytics(DASHBOARD_PERIOD as '7d' | '30d' | '90d' | '1y'),
  })

  const { data: revenueData, isLoading: revenueLoading, isFetching: revenueFetching } = useQuery({
    queryKey: dashboardQueryKeys.revenueForecast,
    queryFn: () => dashboardApi.revenueForecast(),
  })

  const { data: activityData, isLoading: activityLoading, isFetching: activityFetching } = useQuery({
    queryKey: dashboardQueryKeys.activity,
    queryFn: () => dashboardApi.activity({ limit: 10 }),
  })

  const { data: contactsStatsData, isLoading: contactsLoading, isFetching: contactsFetching } = useQuery({
    queryKey: dashboardQueryKeys.contactsCount,
    queryFn: () => contactsApi.stats(),
  })

  const { data: tasksStatsData, isLoading: tasksLoading, isFetching: tasksFetching } = useQuery({
    queryKey: dashboardQueryKeys.tasksDue,
    queryFn: () => dashboardApi.tasksStats(),
  })

  const sales = salesData?.data
  const leads = leadData?.data
  const revenue = revenueData?.data
  const activities = (() => {
    const d = activityData?.data
    if (!d) return []
    return Array.isArray(d) ? d : (d.results ?? [])
  })()
  const contactsCount = contactsStatsData?.data?.active ?? 0
  const tasksDueCount = tasksStatsData?.data?.overdue ?? 0

  const openDeals = sales
    ? sales.total_deals - sales.won_deals - sales.lost_deals
    : 0

  const metrics: (Metric & { isLoading?: boolean; isFetching?: boolean })[] = [
    {
      id: 'leads',
      label: 'Total Leads',
      value: (leads?.total_leads ?? 0).toLocaleString(),
      change: '—',
      trend: 'up',
      color: 'blue',
      icon: UserPlus,
      isLoading: leadsLoading,
      isFetching: leadsFetching,
    },
    {
      id: 'contacts',
      label: 'Active Contacts',
      value: contactsCount.toLocaleString(),
      change: '—',
      trend: 'up',
      color: 'green',
      icon: Users,
      isLoading: contactsLoading,
      isFetching: contactsFetching,
    },
    {
      id: 'opportunities',
      label: 'Open Opportunities',
      value: openDeals.toLocaleString(),
      change: '—',
      trend: 'up',
      color: 'orange',
      icon: TrendingUp,
      isLoading: salesLoading,
      isFetching: salesFetching,
    },
    {
      id: 'deals-closed',
      label: 'Deals Closed',
      value: sales ? formatCurrency(String(getClosedWonValue(sales))) : '$0',
      change: '—',
      trend: 'up',
      color: 'purple',
      icon: DollarSign,
      isLoading: salesLoading,
      isFetching: salesFetching,
    },
    {
      id: 'tasks-due',
      label: 'Tasks Due',
      value: tasksDueCount.toLocaleString(),
      change: '—',
      trend: 'up',
      color: 'red',
      icon: CheckSquare,
      isLoading: tasksLoading,
      isFetching: tasksFetching,
    },
  ]

  const leadPipelineData = (() => {
    const byStatus = leads?.by_status
    if (!byStatus) return []
    if (Array.isArray(byStatus)) {
      return byStatus.map((item) => ({ name: item.status, value: item.count }))
    }
    return Object.entries(byStatus).map(([name, value]) => ({ name, value }))
  })()

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const revenueTrendData = (() => {
    const rows = revenue?.forecast ?? []
    if (rows.length === 0) return []
    const byMonth = new Map<string, number>()
    for (const f of rows) {
      const amount = Number(f.total) || 0
      byMonth.set(f.month, (byMonth.get(f.month) ?? 0) + amount)
    }
    const sorted = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b))
    return sorted.map(([month, total]) => {
      const m = month.slice(5, 7)
      const monthNum = parseInt(m, 10) - 1
      const year = month.slice(2, 4)
      return {
        name: monthNum >= 0 ? `${MONTH_NAMES[monthNum]} '${year}` : month,
        value: Math.round(total / 1000),
        fullValue: total,
        isoDate: month,
      }
    })
  })()

  const mappedActivities: ActivityRow[] = activities.map((a) => {
    const notes = a.notes ?? ''
    const description = /^POST\s+\/api\//i.test(notes) ? '' : notes
    return {
      id: a.id,
      type: mapActivityType(a.entity_type),
      entity_type: a.entity_type,
      displayType: mapActivityType(a.entity_type),
      title: mapActivityTitle(a.type, a.entity_type),
      description,
      timestamp: formatDistanceToNow(new Date(a.logged_at), { addSuffix: true, includeSeconds: true }),
      user: typeof a.actor === 'string' ? a.actor : a.actor?.name ?? '',
      logged_at: a.logged_at,
    }
  })

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
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
            isLoading={metric.isLoading}
            isFetching={metric.isFetching}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2 *:min-w-0 *:overflow-hidden">
        <BarChartComponent
          title="Lead Pipeline Funnel"
          data={leadPipelineData}
          chartConfig={PIPELINE_CHART_CONFIG}
          isLoading={leadsLoading || leadsFetching}
        />
        <LineChartComponent
          title="Revenue Forecast"
          data={revenueTrendData}
          chartConfig={REVENUE_CHART_CONFIG}
          isLoading={revenueLoading || revenueFetching}
        />
      </div>

      {/* Bottom Row: Activity + Quick Actions */}
      <div className={hasQuickActions ? 'grid gap-4 md:grid-cols-3' : undefined}>
        <div className={hasQuickActions ? 'md:col-span-2' : undefined}>
          <RecentActivity activities={mappedActivities} isLoading={activityLoading || activityFetching} />
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
