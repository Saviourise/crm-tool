import { Mail, Phone, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
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

export function AISuggestions() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        AI Next-Best Actions
      </h3>
      {SUGGESTIONS.map((suggestion, index) => {
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

                  {/* Confidence bar */}
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
