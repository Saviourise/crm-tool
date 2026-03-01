import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SentimentBadgeProps {
  contactId: string
}

function getSentiment(id: string): 'positive' | 'neutral' | 'negative' {
  const positiveIds = ['1', '4', '7']
  const neutralIds = ['2', '5', '8']
  if (positiveIds.includes(id)) return 'positive'
  if (neutralIds.includes(id)) return 'neutral'
  return 'negative'
}

const sentimentStyles = {
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  neutral: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  negative: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
}

const sentimentLabels = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
}

export function SentimentBadge({ contactId }: SentimentBadgeProps) {
  const sentiment = getSentiment(contactId)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">AI Sentiment:</span>
      <Badge variant="outline" className={sentimentStyles[sentiment]}>
        <Sparkles className="h-3 w-3 mr-1" />
        {sentimentLabels[sentiment]}
      </Badge>
    </div>
  )
}
