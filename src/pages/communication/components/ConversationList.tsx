import { useState } from 'react'
import { Search, Mail, MessageSquare, Phone, StickyNote, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Channel, ContactThread } from '../typings'

const CHANNEL_ICONS: Record<Channel, React.ElementType> = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
  note: StickyNote,
}

const FILTER_OPTIONS: { value: Channel | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'call', label: 'Calls' },
]

interface ConversationListProps {
  threads: ContactThread[]
  selectedId: string | null
  onSelect: (id: string) => void
  draftCount: number
  viewingDrafts: boolean
  onViewDrafts?: () => void
}

export function ConversationList({ threads, selectedId, onSelect, draftCount, viewingDrafts, onViewDrafts }: ConversationListProps) {
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all')

  const filtered = threads.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.contactName.toLowerCase().includes(search.toLowerCase()) ||
      t.contactCompany.toLowerCase().includes(search.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(search.toLowerCase())
    const matchesChannel = channelFilter === 'all' || t.lastChannel === channelFilter
    return matchesSearch && matchesChannel
  })

  return (
    <div className="flex flex-col h-full w-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Channel filter pills */}
      <div className="px-3 py-2 border-b flex items-center gap-1.5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setChannelFilter(opt.value)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              channelFilter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Drafts folder */}
      {onViewDrafts && <button
        type="button"
        onClick={onViewDrafts}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2.5 border-b text-sm transition-colors hover:bg-muted/50',
          viewingDrafts ? 'bg-primary/5 border-l-2 border-l-primary font-medium text-foreground' : 'text-muted-foreground'
        )}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Drafts</span>
        {draftCount > 0 && (
          <span className={cn(
            'text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center font-medium',
            viewingDrafts ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            {draftCount}
          </span>
        )}
      </button>}

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-12 text-center px-4">
            <p className="text-sm text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          filtered.map((thread) => {
            const LastChannelIcon = CHANNEL_ICONS[thread.lastChannel]
            const isSelected = thread.id === selectedId
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelect(thread.id)}
                className={cn(
                  'w-full text-left px-3 py-3 border-b transition-colors hover:bg-muted/50',
                  isSelected && 'bg-primary/5 border-l-2 border-l-primary'
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div
                    className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0',
                      thread.avatarColor
                    )}
                  >
                    {thread.contactInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={cn('text-sm font-medium truncate', thread.unreadCount > 0 && 'font-semibold')}>
                        {thread.contactName}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{thread.lastMessageTime}</span>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-1">{thread.contactCompany}</p>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <LastChannelIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{thread.lastMessage}</span>
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-semibold rounded-full min-w-[1.1rem] h-4 flex items-center justify-center px-1 shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
