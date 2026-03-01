import { useState } from 'react'
import { Download, ChevronDown, FileText, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { SalesPerformance } from './components/SalesPerformance'
import { LeadAnalytics } from './components/LeadAnalytics'
import { RevenueForecast } from './components/RevenueForecast'
import { RequireFeature } from '@/auth/guards'
import { useAuth } from '@/auth/context'
import {
  MONTHLY_REVENUE,
  WON_LOST_DATA,
  SALES_REPS,
  LEAD_FUNNEL,
  LEAD_SOURCES,
  LEAD_TREND,
  FORECAST_DATA,
  FORECAST_DEALS,
} from './data'

type ReportTab = 'sales' | 'leads' | 'forecast'

const TABS: { id: ReportTab; label: string }[] = [
  { id: 'sales',    label: 'Sales Performance' },
  { id: 'leads',    label: 'Lead Analytics' },
  { id: 'forecast', label: 'Revenue Forecast' },
]

function exportPDF() {
  const style = document.createElement('style')
  style.id = 'print-override'
  style.textContent = `
    @media print {
      aside, header, nav, [data-sidebar], .no-print { display: none !important; }
      main { margin: 0 !important; padding: 0 !important; }
    }
  `
  document.head.appendChild(style)
  window.print()
  setTimeout(() => document.getElementById('print-override')?.remove(), 1000)
}

function buildCSVForTab(activeTab: ReportTab): string {
  if (activeTab === 'sales') {
    const rows: string[] = [
      'Monthly Revenue',
      'Month,Revenue',
      ...MONTHLY_REVENUE.map((r) => `${r.month},${r.revenue}`),
      '',
      'Won vs Lost',
      'Month,Won,Lost',
      ...WON_LOST_DATA.map((r) => `${r.month},${r.won},${r.lost}`),
      '',
      'Sales Reps',
      'Name,Deals Won,Revenue,Quota,Attainment %',
      ...SALES_REPS.map((r) => `${r.name},${r.dealsWon},${r.revenue},${r.quota},${r.attainment}`),
    ]
    return rows.join('\n')
  }
  if (activeTab === 'leads') {
    const rows: string[] = [
      'Lead Funnel',
      'Stage,Count',
      ...LEAD_FUNNEL.map((r) => `${r.stage},${r.count}`),
      '',
      'Lead Sources',
      'Source,Percentage',
      ...LEAD_SOURCES.map((r) => `${r.name},${r.value}`),
      '',
      'Lead Trend',
      'Week,Leads',
      ...LEAD_TREND.map((r) => `${r.week},${r.leads}`),
    ]
    return rows.join('\n')
  }
  // forecast
  const rows: string[] = [
    'Revenue Forecast',
    'Month,Actual,Forecast',
    ...FORECAST_DATA.map((r) => `${r.month},${r.actual ?? ''},${r.forecast}`),
    '',
    'Pipeline Deals',
    'Deal,Company,Value,Stage,Probability %,Expected Close,Owner',
    ...FORECAST_DEALS.map(
      (r) => `"${r.name}","${r.company}",${r.value},${r.stage},${r.probability},${r.expectedClose},${r.owner}`
    ),
  ]
  return rows.join('\n')
}

function exportCSV(activeTab: ReportTab) {
  const csv = buildCSVForTab(activeTab)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${activeTab}-report.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales')
  const { can } = useAuth()

  return (
    <RequireFeature feature="reports">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze sales performance, lead metrics, and revenue forecasts.
          </p>
        </div>
        {can('reports.export') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCSV(activeTab)}>
                <Table2 className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Tab nav */}
      <div className="border-b overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'sales'    && <SalesPerformance />}
      {activeTab === 'leads'    && <LeadAnalytics />}
      {activeTab === 'forecast' && <RevenueForecast />}
    </div>
    </RequireFeature>
  )
}
