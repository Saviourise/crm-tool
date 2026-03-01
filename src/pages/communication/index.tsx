import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { toast } from 'sonner'
import type { Channel, EmailDraft } from './typings'
import { MOCK_CONVERSATIONS } from './data'
import { ConversationList } from './components/ConversationList'
import { ConversationView } from './components/ConversationView'
import { DraftsView } from './components/DraftsView'

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
  const [searchParams] = useSearchParams()
  const contactId = searchParams.get('contactId')

  const [selectedId, setSelectedId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.thread.id ?? null)
  const [activeTab, setActiveTab] = useState<Channel>('email')
  const [viewMode, setViewMode] = useState<'conversations' | 'drafts'>('conversations')
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [pendingDraft, setPendingDraft] = useState<EmailDraft | null>(null)

  // Auto-select conversation when navigated from a contact
  useEffect(() => {
    if (!contactId || MOCK_CONVERSATIONS.length === 0) return
    // Try to find a conversation whose thread.id matches the contactId directly
    const directMatch = MOCK_CONVERSATIONS.find((c) => c.thread.id === contactId)
    if (directMatch) {
      setSelectedId(directMatch.thread.id)
      setViewMode('conversations')
      return
    }
    // Fallback: find by contactName containing the contactId string
    const nameMatch = MOCK_CONVERSATIONS.find(
      (c) =>
        c.thread.contactName.toLowerCase().includes(contactId.toLowerCase()) ||
        c.thread.contactCompany?.toLowerCase().includes(contactId.toLowerCase())
    )
    if (nameMatch) {
      setSelectedId(nameMatch.thread.id)
      setViewMode('conversations')
    }
  }, [contactId])

  const selected = MOCK_CONVERSATIONS.find((c) => c.thread.id === selectedId) ?? null

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setActiveTab('email')
    setViewMode('conversations')
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
    // Remove from drafts so it doesn't duplicate on re-save
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
  }

  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    toast.error('Draft discarded')
  }

  return (
    <div className="-m-6 flex overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
      <ConversationList
        threads={MOCK_CONVERSATIONS.map((c) => c.thread)}
        selectedId={viewMode === 'conversations' ? selectedId : null}
        onSelect={handleSelect}
        draftCount={drafts.length}
        viewingDrafts={viewMode === 'drafts'}
        onViewDrafts={() => setViewMode('drafts')}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {viewMode === 'drafts' ? (
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
            onSaveDraft={handleSaveDraft}
            initialDraft={pendingDraft}
            onDraftOpened={() => setPendingDraft(null)}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
