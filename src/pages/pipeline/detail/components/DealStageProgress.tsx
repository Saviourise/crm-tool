import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PIPELINE_STAGES, STAGE_CONFIG } from '../../data'
import type { Stage } from '../../typings'

interface DealStageProgressProps {
  currentStage: Stage
}

export function DealStageProgress({ currentStage }: DealStageProgressProps) {
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage)

  // Determine display order: always show closed-won and closed-lost but highlight current
  const isClosedLost = currentStage === 'closed-lost'

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-5">Pipeline Stage</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, index) => {
            const config = STAGE_CONFIG[stage]
            const isCurrent = stage === currentStage
            const isPast = index < currentIndex && !isClosedLost
            const isLostStage = stage === 'closed-lost'

            // Skip the closed-lost stage in the visual flow unless it's the current
            if (isLostStage && !isCurrent) return null

            let stageClass = ''
            let labelClass = ''

            if (isCurrent && isLostStage) {
              stageClass = 'bg-destructive text-destructive-foreground'
              labelClass = 'text-destructive'
            } else if (isCurrent) {
              stageClass = 'bg-primary text-primary-foreground'
              labelClass = 'text-primary font-semibold'
            } else if (isPast) {
              stageClass = 'bg-muted text-muted-foreground'
              labelClass = 'text-muted-foreground'
            } else {
              stageClass = 'border border-border text-muted-foreground bg-background'
              labelClass = 'text-muted-foreground'
            }

            const showConnector = index < PIPELINE_STAGES.length - 2 && !isLostStage

            return (
              <div key={stage} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                      stageClass
                    )}
                  >
                    {isPast ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={cn('text-[10px] text-center leading-tight max-w-[64px]', labelClass)}>
                    {config.label}
                  </span>
                </div>

                {/* Connector line */}
                {showConnector && (
                  <div
                    className={cn(
                      'h-px w-6 shrink-0 mx-1',
                      isPast || (index < currentIndex) ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
