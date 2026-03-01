import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_LEADS } from '../data'
import { LeadProfileCard } from './components/LeadProfileCard'
import { LeadScoreBreakdown } from './components/LeadScoreBreakdown'
import { ActivityTimeline } from './components/ActivityTimeline'
import { AISuggestions } from './components/AISuggestions'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'activity' | 'ai-insights'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'ai-insights', label: 'AI Insights' },
]

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const lead = MOCK_LEADS.find((l) => l.id === id)

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground text-lg">Lead not found.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Profile card */}
      <LeadProfileCard lead={lead} />

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-2 px-3 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <LeadScoreBreakdown score={lead.score} />
        </div>
      )}

      {activeTab === 'activity' && (
        <ActivityTimeline leadId={lead.id} />
      )}

      {activeTab === 'ai-insights' && (
        <AISuggestions />
      )}
    </div>
  )
}
