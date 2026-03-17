import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { contactsApi } from '@/api/contacts'
import { mapApiContactToContact } from '../apiMappers'
import { ContactProfileCard } from './components/ContactProfileCard'
import { ActivityTimeline } from './components/ActivityTimeline'
import { RelatedDeals } from './components/RelatedDeals'
import { RelatedTasks } from './components/RelatedTasks'
import { ContactMessages } from './components/ContactMessages'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'activity' | 'tasks' | 'deals' | 'communication'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'deals', label: 'Deals' },
  { id: 'communication', label: 'Communication' },
]

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.get(id!),
    enabled: !!id,
  })

  const contact = data?.data ? mapApiContactToContact(data.data) : undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!id || error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground text-lg">Contact not found.</p>
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
      <ContactProfileCard contact={contact} />

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RelatedDeals contactId={contact.id} />
            <RelatedTasks contactId={contact.id} />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <ActivityTimeline contactId={contact.id} />
      )}

      {activeTab === 'tasks' && (
        <RelatedTasks contactId={contact.id} />
      )}

      {activeTab === 'deals' && (
        <RelatedDeals contactId={contact.id} />
      )}

      {activeTab === 'communication' && (
        <ContactMessages contactId={contact.id} />
      )}
    </div>
  )
}
