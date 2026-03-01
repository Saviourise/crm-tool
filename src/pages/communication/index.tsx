import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Channel, EmailDraft } from './typings'
import { MOCK_CONVERSATIONS } from './data'
import { ConversationList } from './components/ConversationList'
import { ConversationView } from './components/ConversationView'
import { DraftsView } from './components/DraftsView'
import { useAuth } from '@/auth/context'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">Select a conversation</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Choose a contact from the list to view emails, SMS, call history, and notes.
      </p>
    </div>
  )
}

export default function CommunicationCenter() {
  const { can } = useAuth()
  const canCompose = can('communication.create')

  const [searchParams] = useSearchParams()
  const contactId = searchParams.get('contactId')

  const [selectedId, setSelectedId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.thread.id ?? null)
  const [activeTab, setActiveTab] = useState<Channel>('email')
  const [viewMode, setViewMode] = useState<'conversations' | 'drafts'>('conversations')
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [pendingDraft, setPendingDraft] = useState<EmailDraft | null>(null)
  // Mobile: 'list' shows the conversation list, 'detail' shows the selected conversation
  const [mobilePanel, setMobilePanel] = useState<'list' | 'detail'>('list')

  // Auto-select conversation when navigated from a contact
  useEffect(() => {
    if (!contactId || MOCK_CONVERSATIONS.length === 0) return
    const directMatch = MOCK_CONVERSATIONS.find((c) => c.thread.id === contactId)
    if (directMatch) {
      setSelectedId(directMatch.thread.id)
      setViewMode('conversations')
      setMobilePanel('detail')
      return
    }
    const nameMatch = MOCK_CONVERSATIONS.find(
      (c) =>
        c.thread.contactName.toLowerCase().includes(contactId.toLowerCase()) ||
        c.thread.contactCompany?.toLowerCase().includes(contactId.toLowerCase())
    )
    if (nameMatch) {
      setSelectedId(nameMatch.thread.id)
      setViewMode('conversations')
      setMobilePanel('detail')
    }
  }, [contactId])

  const selected = MOCK_CONVERSATIONS.find((c) => c.thread.id === selectedId) ?? null

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setActiveTab('email')
    setViewMode('conversations')
    setMobilePanel('detail')
  }

  const handleSaveDraft = (subject: string, body: string) => {
    if (!selected) return
    const draft: EmailDraft = {
      id: `draft-${Date.now()}`,
      contactId: selected.thread.id,
      contactName: selected.thread.contactName,
      contactInitials: selected.thread.contactInitials,
      avatarColor: selected.thread.avatarColor,
      subject,
      body,
      savedAt: 'Just now',
    }
    setDrafts((prev) => [draft, ...prev])
    toast.success('Draft saved', { description: `Draft for ${selected.thread.contactName} saved to Drafts.` })
  }

  const handleEditDraft = (draft: EmailDraft) => {
    setSelectedId(draft.contactId)
    setActiveTab('email')
    setViewMode('conversations')
    setPendingDraft(draft)
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
    setMobilePanel('detail')
  }

  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    toast.error('Draft discarded')
  }

  return (
    // Negative margins escape the parent padding; height fills the remaining viewport
    <div
      className="-m-4 md:-m-6 lg:-m-8 flex overflow-hidden"
      style={{ height: 'calc(100dvh - 3.5rem)' }}
    >
      {/* ── Conversation list panel ─────────────────────────────────────────── */}
      {/* Full width on mobile when showing list; fixed 320px sidebar on md+ */}
      <div
        className={cn(
          'flex flex-col border-r h-full shrink-0',
          'w-full md:w-80',
          // On mobile: show only when mobilePanel === 'list'
          mobilePanel === 'detail' ? 'hidden md:flex' : 'flex'
        )}
      >
        <ConversationList
          threads={MOCK_CONVERSATIONS.map((c) => c.thread)}
          selectedId={viewMode === 'conversations' ? selectedId : null}
          onSelect={handleSelect}
          draftCount={canCompose ? drafts.length : 0}
          viewingDrafts={viewMode === 'drafts'}
          onViewDrafts={canCompose ? () => { setViewMode('drafts'); setMobilePanel('detail') } : undefined}
        />
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      {/* Full width on mobile when showing detail; flex-1 on md+ */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 overflow-hidden',
          // On mobile: show only when mobilePanel === 'detail'
          mobilePanel === 'list' ? 'hidden md:flex' : 'flex'
        )}
      >
        {viewMode === 'drafts' && canCompose ? (
          <DraftsView
            drafts={drafts}
            onEdit={handleEditDraft}
            onDelete={handleDeleteDraft}
          />
        ) : selected ? (
          <ConversationView
            conversation={selected}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSaveDraft={canCompose ? handleSaveDraft : undefined}
            initialDraft={canCompose ? pendingDraft : null}
            onDraftOpened={() => setPendingDraft(null)}
            onBack={() => setMobilePanel('list')}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
