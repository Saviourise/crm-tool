import { useState } from 'react'
import { Mail, MessageSquare, Phone, StickyNote, CheckCircle2, Plus, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Channel, ContactConversation, EmailDraft } from '../typings'
import { getStatusConfig } from '../utils'
import { EmailThread } from './EmailThread'
import { SMSThread } from './SMSThread'
import { CallLog } from './CallLog'
import { Notes } from './Notes'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'

const TABS: { id: Channel; label: string; icon: React.ElementType }[] = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'call', label: 'Calls', icon: Phone },
  { id: 'note', label: 'Notes', icon: StickyNote },
]

interface ConversationViewProps {
  conversation: ContactConversation
  activeTab: Channel
  onTabChange: (tab: Channel) => void
  onSaveDraft?: (subject: string, body: string) => void
  initialDraft?: EmailDraft | null
  onDraftOpened?: () => void
  onBack?: () => void
}

export function ConversationView({ conversation, activeTab, onTabChange, onSaveDraft, initialDraft, onDraftOpened, onBack }: ConversationViewProps) {
  const [taskOpen, setTaskOpen] = useState(false)
  const { thread, emails, sms, calls, notes } = conversation
  const statusCfg = getStatusConfig(thread.status)

  const tabCounts: Record<Channel, number> = {
    email: emails.length,
    sms: sms.length,
    call: calls.length,
    note: notes.length,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Contact header */}
      <div className="px-3 py-3 border-b flex items-center gap-2 shrink-0 md:px-5 md:py-3.5 md:gap-3">
        {/* Back button — mobile only */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 -ml-1 md:hidden"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to conversations</span>
          </Button>
        )}
        <div
          className={cn(
            'h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 md:h-10 md:w-10',
            thread.avatarColor
          )}
        >
          {thread.contactInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold">{thread.contactName}</h2>
            <Badge variant="outline" className={cn('text-xs gap-1', statusCfg.className)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{thread.contactCompany}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-2 md:px-3"
            onClick={() => toast.success('Marked as resolved', { description: `${thread.contactName}'s conversation is resolved.` })}
          >
            <CheckCircle2 className="h-3.5 w-3.5 md:mr-1.5" />
            <span className="hidden md:inline">Resolve</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-2 md:px-3"
            onClick={() => setTaskOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 md:mr-1.5" />
            <span className="hidden md:inline">Task</span>
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b px-5 shrink-0">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const count = tabCounts[tab.id]
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
                <span
                  className={cn(
                    'text-xs rounded-full px-1.5 min-w-[1.2rem] text-center',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'email' && (
          <EmailThread
            emails={emails}
            contact={thread}
            onSaveDraft={onSaveDraft}
            initialDraft={initialDraft}
            onDraftOpened={onDraftOpened}
          />
        )}
        {activeTab === 'sms' && <SMSThread messages={sms} contact={thread} />}
        {activeTab === 'call' && <CallLog calls={calls} contact={thread} />}
        {activeTab === 'note' && <Notes notes={notes} contact={thread} />}
      </div>

      <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  )
}
