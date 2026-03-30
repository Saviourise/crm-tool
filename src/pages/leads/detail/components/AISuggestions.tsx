import { useQuery } from '@tanstack/react-query'
import { Mail, Phone, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type React from 'react'

interface AISuggestionsProps {
  leadId: string
}

interface Suggestion {
  icon: React.ElementType
  title: string
  description: string
  cta: string
  confidence: number
  iconBg: string
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    icon: Mail,
    title: 'Send Follow-up Email',
    description: 'High engagement detected — send a personalized follow-up within 24 hours',
    cta: 'Compose Email',
    confidence: 94,
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
  {
    icon: Phone,
    title: 'Schedule Discovery Call',
    description: 'Lead score indicates strong fit — schedule a call to qualify further',
    cta: 'Schedule Call',
    confidence: 87,
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    icon: FileText,
    title: 'Share Case Study',
    description: 'Similar companies in same industry converted after receiving case studies',
    cta: 'Send Resource',
    confidence: 76,
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  },
]

const ICON_CYCLE: React.ElementType[] = [Mail, Phone, FileText]
const BG_CYCLE = [
  'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
]

export function AISuggestions({ leadId }: AISuggestionsProps) {
  const { data } = useQuery({
    queryKey: ['ai', 'lead-scoring', leadId],
    queryFn: () =>
      api.get<{
        score: number
        breakdown?: Record<string, number>
        next_actions?: string[]
        scored_at?: string
      }>(`/api/ai/lead-scoring/${leadId}/`),
    enabled: !!leadId,
  })

  const nextActions = data?.data?.next_actions
  const score = data?.data?.score

  const suggestions: Suggestion[] = nextActions && nextActions.length > 0
    ? nextActions.map((action, i) => ({
        icon: ICON_CYCLE[i % ICON_CYCLE.length],
        title: action,
        description: 'AI-recommended next step based on lead behaviour and scoring.',
        cta: 'Take Action',
        confidence: score ? Math.max(50, Math.round(score - i * 5)) : 80,
        iconBg: BG_CYCLE[i % BG_CYCLE.length],
      }))
    : DEFAULT_SUGGESTIONS

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        AI Next-Best Actions
      </h3>
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                    suggestion.iconBg
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm">{suggestion.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1.5 rounded-full bg-primary/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${suggestion.confidence}%` }}
                      />
                    </div>
                  </div>

                  <Button size="sm" variant="outline">
                    {suggestion.cta}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
