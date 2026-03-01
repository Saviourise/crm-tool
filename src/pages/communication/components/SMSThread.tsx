import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ContactThread, SMSMessage } from '../typings'

interface SMSThreadProps {
  messages: SMSMessage[]
  contact: ContactThread
}

export function SMSThread({ messages, contact }: SMSThreadProps) {
  const [localMessages, setLocalMessages] = useState<SMSMessage[]>(messages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: SMSMessage = {
      id: `sms-local-${Date.now()}`,
      body: input.trim(),
      timestamp: 'Just now',
      direction: 'outbound',
    }
    setLocalMessages((prev) => [...prev, newMsg])
    setInput('')
    toast.success('SMS sent', { description: `Sent to ${contact.contactName}` })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {localMessages.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No messages yet. Send one below.
          </div>
        ) : (
          localMessages.map((msg) => {
            const isOutbound = msg.direction === 'outbound'
            return (
              <div
                key={msg.id}
                className={cn('flex flex-col gap-0.5', isOutbound ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                    isOutbound
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  )}
                >
                  {msg.body}
                </div>
                <span className="text-[11px] text-muted-foreground px-1">{msg.timestamp}</span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={`Message ${contact.contactName}… (Enter to send)`}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
