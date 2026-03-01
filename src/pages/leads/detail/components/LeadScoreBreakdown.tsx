import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

interface LeadScoreBreakdownProps {
  score: number
}

export function LeadScoreBreakdown({ score }: LeadScoreBreakdownProps) {
  const data = [
    { category: 'Engagement', value: Math.round(score * 0.3) },
    { category: 'Fit', value: Math.round(score * 0.25) },
    { category: 'Intent', value: Math.round(score * 0.25) },
    { category: 'Activity', value: Math.round(score * 0.2) },
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4">Score Breakdown</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
