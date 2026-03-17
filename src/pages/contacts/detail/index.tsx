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
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'activity' | 'tasks' | 'deals' | 'communication'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'deals', label: 'Deals' },
  { id: 'communication', label: 'Communication' },
]

const MOCK_MESSAGES = [
  {
    id: 1,
    direction: 'inbound' as const,
    text: 'Hi, just wanted to follow up on the proposal you sent last week. We had a chance to review it internally.',
    time: '2 hours ago',
    channel: 'Email',
  },
  {
    id: 2,
    direction: 'outbound' as const,
    text: 'Great to hear! Happy to jump on a call this week to address any questions. Does Thursday afternoon work?',
    time: '1 hour ago',
    channel: 'Email',
  },
  {
    id: 3,
    direction: 'inbound' as const,
    text: 'Thursday works perfectly. Let us say 2 PM EST?',
    time: '45 min ago',
    channel: 'Email',
  },
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

  const contactName = `${contact.firstName} ${contact.lastName}`

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
            <RelatedDeals contactName={contactName} />
            <RelatedTasks contactName={contactName} />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <ActivityTimeline contactId={contact.id} />
      )}

      {activeTab === 'tasks' && (
        <RelatedTasks contactName={contactName} />
      )}

      {activeTab === 'deals' && (
        <RelatedDeals contactName={contactName} />
      )}

      {activeTab === 'communication' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Recent Messages
            </h3>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/communication?contactId=${contact.id}`}>
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Open Full Inbox
              </Link>
            </Button>
          </div>

          {/* Mock messages */}
          <div className="flex flex-col gap-3">
            {MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-xl px-4 py-2.5',
                    msg.direction === 'outbound'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 mt-1',
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs',
                        msg.direction === 'outbound'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {msg.time}
                    </span>
                    <MessageSquare
                      className={cn(
                        'h-3 w-3',
                        msg.direction === 'outbound'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        msg.direction === 'outbound'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {msg.channel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
