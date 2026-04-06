import { useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { CHART_CONTAINER_COMPACT_CLASS } from '@/lib/chartLayout'
import { api } from '@/lib/api'

interface LeadScoreBreakdownProps {
  score: number
  leadId: string
}

interface AiScoreBreakdown {
  engagement?: number
  fit?: number
  activity?: number
  intent?: number
  [key: string]: number | undefined
}

interface AiScoreResponse {
  id: string
  lead: string
  score: number
  breakdown?: AiScoreBreakdown
  next_actions?: string[]
  scored_at?: string
}

const chartConfig = {
  value: { label: 'Score', color: 'var(--primary)' },
} satisfies ChartConfig

function buildChartData(score: number, breakdown?: AiScoreBreakdown) {
  if (breakdown && Object.keys(breakdown).length > 0) {
    return Object.entries(breakdown)
      .filter(([, v]) => v !== undefined)
      .map(([key, value]) => ({
        category: key.charAt(0).toUpperCase() + key.slice(1),
        value: value as number,
      }))
  }
  return [
    { category: 'Engagement', value: Math.round(score * 0.3) },
    { category: 'Fit', value: Math.round(score * 0.25) },
    { category: 'Intent', value: Math.round(score * 0.25) },
    { category: 'Activity', value: Math.round(score * 0.2) },
  ]
}

export function LeadScoreBreakdown({ score, leadId }: LeadScoreBreakdownProps) {
  const gradId = useId().replace(/:/g, '')
  const { data } = useQuery({
    queryKey: ['ai', 'lead-scoring', leadId],
    queryFn: () => api.get<AiScoreResponse>(`/api/ai/lead-scoring/${leadId}/`),
    enabled: !!leadId,
  })

  const apiData = data?.data
  const chartScore = apiData?.score ?? score
  const chartData = buildChartData(chartScore, apiData?.breakdown)

  return (
    <Card>
      <CardContent className="pt-2">
        <h3 className="mb-4 text-sm font-semibold">Score Breakdown</h3>
        <ChartContainer config={chartConfig} className={CHART_CONTAINER_COMPACT_CLASS}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id={`scoreBar-${gradId}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-value)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={88}
              className="text-xs"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'var(--muted)', opacity: 0.25 }}
            />
            <Bar
              dataKey="value"
              fill={`url(#scoreBar-${gradId})`}
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
