import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { onOpenChat } from '@/lib/chatStore'

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  time: string
}

function getTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getBotResponse(input: string): string {
  const lower = input.toLowerCase()
  if (/\b(hi|hello|hey)\b/.test(lower))
    return "Hello! I'm your AI support assistant. How can I help you today?"
  if (/contact/.test(lower))
    return 'You can manage contacts from the Contacts section in the sidebar. Need help with something specific?'
  if (/deal|pipeline/.test(lower))
    return 'The Pipeline section lets you track deals across stages using a Kanban board or list view. What would you like to know?'
  if (/report|analytic/.test(lower))
    return 'The Reports section offers Sales Performance, Lead Analytics, and Revenue Forecast tabs. You can export as PDF or CSV too.'
  if (/billing|plan|upgrade|price/.test(lower))
    return 'You can manage your subscription in Settings → Billing. Would you like me to walk you through the plans?'
  if (/lead/.test(lower))
    return 'Leads can be found in the Leads section. You can score, qualify, and convert them to contacts from there.'
  if (/task/.test(lower))
    return 'Tasks are in the Tasks section. You can set due dates, assign to team members, and filter by priority.'
  if (/calendar|meeting|event/.test(lower))
    return 'The Calendar shows all your events, meetings, and tasks in a visual monthly or weekly layout.'
  if (/marketing|campaign/.test(lower))
    return 'The Marketing section has Campaigns, Templates, and an AI Hub for generating email content.'
  if (/user|team|member/.test(lower))
    return 'You can manage team members, roles, and permissions in the Users section under Admin.'
  if (/setting/.test(lower))
    return 'Settings covers your profile, password, notifications, billing, integrations, and more.'
  if (/thank|thanks/.test(lower))
    return "You're welcome! Is there anything else I can help you with?"
  return "Thanks for reaching out! For detailed assistance, our team typically responds within 2 hours. Is there anything else I can help clarify?"
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'bot',
    text: "Hi! I'm your AI support assistant. I can help you navigate the CRM, answer questions about features, or connect you with our team. What can I help you with today?",
    time: getTime(),
  },
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    return onOpenChat(() => setOpen(true))
  }, [])

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, open])

  function sendMessage() {
    const text = input.trim()
    if (!text || typing) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text, time: getTime() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: getBotResponse(text), time: getTime() },
      ])
      setTyping(false)
    }, 1000 + Math.random() * 500)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="w-[360px] flex flex-col rounded-2xl shadow-2xl border bg-background overflow-hidden"
          style={{ height: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none">AI Support</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs opacity-80">Online · Typically replies instantly</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 rounded-full shrink-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}>
                {msg.role === 'bot' && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[240px] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'bot'
                      ? 'bg-muted text-foreground rounded-tl-sm'
                      : 'bg-primary text-primary-foreground rounded-tr-sm'
                  )}
                >
                  {msg.text}
                  <p
                    className={cn(
                      'text-[10px] mt-1 opacity-60',
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    )}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 p-3 border-t shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ maxHeight: '80px', overflowY: 'auto' }}
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-xl shrink-0"
              onClick={sendMessage}
              disabled={!input.trim() || typing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
