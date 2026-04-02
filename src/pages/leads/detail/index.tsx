import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EntityActivityTimeline } from '@/components/common/EntityActivityTimeline'
import { leadsApi } from '@/api/leads'
import { mapApiLeadToLead } from '../apiMappers'
import { LeadProfileCard } from './components/LeadProfileCard'
import { LeadScoreBreakdown } from './components/LeadScoreBreakdown'
import { LeadRelatedTasks } from './components/LeadRelatedTasks'
import { AISuggestions } from './components/AISuggestions'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'activity' | 'tasks' | 'ai-insights'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'ai-insights', label: 'AI Insights' },
]

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.get(id!),
    enabled: !!id,
  })

  const lead = data?.data ? mapApiLeadToLead(data.data) : undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!id || error || !lead) {
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
    <div className="flex flex-col gap-6">
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
          <LeadScoreBreakdown score={lead.score} leadId={lead.id} />
        </div>
      )}

      {activeTab === 'activity' && (
        <EntityActivityTimeline
          queryKey={['leads', lead.id, 'activity']}
          endpoint={`/api/leads/${lead.id}/activity/`}
        />
      )}

      {activeTab === 'tasks' && (
        <LeadRelatedTasks
          leadId={lead.id}
          leadName={`${lead.firstName} ${lead.lastName}`}
        />
      )}

      {activeTab === 'ai-insights' && (
        <AISuggestions leadId={lead.id} />
      )}
    </div>
  )
}
