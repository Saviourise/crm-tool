import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pipelineApi } from '@/api/pipeline'
import { mapApiDealToOpportunity } from '../apiMappers'
import { DealProfileCard } from './components/DealProfileCard'
import { DealStageProgress } from './components/DealStageProgress'
import { DealActivityTimeline } from './components/DealActivityTimeline'
import { DealContactsCard } from './components/DealContactsCard'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'activity' | 'contacts'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'contacts', label: 'Contacts' },
]

export default function DealDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data: dealRes, isLoading, isError } = useQuery({
    queryKey: ['pipeline', 'deals', id, 'detail'],
    queryFn: () => pipelineApi.getDeal(id!),
    enabled: !!id,
  })

  const opportunity = dealRes?.data ? mapApiDealToOpportunity(dealRes.data) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !opportunity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground text-lg">Deal not found.</p>
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
      <DealProfileCard opportunity={opportunity} />

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
          <DealStageProgress currentStage={opportunity.stage} />
        </div>
      )}

      {activeTab === 'activity' && (
        <DealActivityTimeline dealId={opportunity.id} />
      )}

      {activeTab === 'contacts' && (
        <DealContactsCard dealId={opportunity.id} />
      )}
    </div>
  )
}
