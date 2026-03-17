import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ExternalLink, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { contactsApi } from '@/api/contacts'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ContactMessagesProps {
  contactId: string
}

function formatMessageTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

function getMessageText(msg: { text?: string; body?: string }): string {
  return msg.text ?? msg.body ?? ''
}

function getMessageTimestamp(msg: { timestamp?: string; sent_at?: string; created_at?: string }): string {
  return msg.timestamp ?? msg.sent_at ?? msg.created_at ?? ''
}

export function ContactMessages({ contactId }: ContactMessagesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', contactId, 'messages'],
    queryFn: () => contactsApi.messages(contactId),
    enabled: !!contactId,
  })

  const messages = data?.data?.results ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Recent Messages
        </h3>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/communication?contactId=${contactId}`}>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Open Full Inbox
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
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
                <p className="text-sm leading-relaxed">{getMessageText(msg)}</p>
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
                    {formatMessageTime(getMessageTimestamp(msg))}
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
      )}
    </div>
  )
}
