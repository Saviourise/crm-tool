import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ChartData {
  label: string
  value: number
  color: string
}

interface PerformanceChartProps {
  title: string
  data: ChartData[]
  type?: 'bar' | 'line'
}

export function PerformanceChart({ title, data, type = 'bar' }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            Monthly
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {type === 'bar' ? (
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-[200px] flex items-end justify-between gap-2">
            {data.map((item, index) => {
              const height = (item.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: 160 }}>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${height}%`,
                        backgroundColor: item.color,
                        minHeight: '8px',
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-center">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
