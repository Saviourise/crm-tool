import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Reply, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ContactThread, EmailMessage, EmailDraft } from '../typings'

interface EmailThreadProps {
  emails: EmailMessage[]
  contact: ContactThread
  onSaveDraft: (subject: string, body: string) => void
  initialDraft?: EmailDraft | null
  onDraftOpened?: () => void
}

function EmailCard({ email }: { email: EmailMessage }) {
  const [expanded, setExpanded] = useState(!email.read || email.direction === 'inbound')
  const isOutbound = email.direction === 'outbound'

  return (
    <div className={cn('rounded-lg border', !email.read && 'border-primary/30 bg-primary/[0.02]')}>
      <button
        type="button"
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/30 transition-colors rounded-t-lg"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={cn(
          'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isOutbound ? 'bg-primary/10' : 'bg-muted'
        )}>
          {isOutbound
            ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
            : <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('text-sm truncate', !email.read ? 'font-semibold' : 'font-medium')}>
              {email.subject}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">{email.timestamp}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOutbound ? `To: ${email.to}` : `From: ${email.from}`}
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t">
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
            {email.body}
          </pre>
        </div>
      )}
    </div>
  )
}

interface ComposeAreaProps {
  contact: ContactThread
  onSaveDraft: (subject: string, body: string) => void
  initialDraft?: EmailDraft | null
  onDraftOpened?: () => void
}

function ComposeArea({ contact, onSaveDraft, initialDraft, onDraftOpened }: ComposeAreaProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // Pre-fill and open when a draft is passed in
  useEffect(() => {
    if (initialDraft) {
      setSubject(initialDraft.subject)
      setBody(initialDraft.body)
      setOpen(true)
      onDraftOpened?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDraft?.id])

  const handleSend = () => {
    if (!body.trim()) return
    toast.success('Email sent', { description: `Sent to ${contact.contactName}` })
    setSubject('')
    setBody('')
    setOpen(false)
  }

  const handleSaveDraft = () => {
    onSaveDraft(subject, body)
    setSubject('')
    setBody('')
    setOpen(false)
  }

  if (!open) {
    return (
      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => setOpen(true)}>
          <Reply className="h-3.5 w-3.5" />
          Compose Email
        </Button>
      </div>
    )
  }

  return (
    <div className="border-t bg-background">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">New Email</span>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>Discard</Button>
      </div>
      <div className="p-3 space-y-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input value={contact.contactName} readOnly className="h-8 text-sm bg-muted/50" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject…"
            className="h-8 text-sm"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Write your message…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleSaveDraft}
            disabled={!subject.trim() && !body.trim()}
          >
            Save Draft
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleSend} disabled={!body.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export function EmailThread({ emails, contact, onSaveDraft, initialDraft, onDraftOpened }: EmailThreadProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {emails.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No emails yet</div>
        ) : (
          emails.map((email) => <EmailCard key={email.id} email={email} />)
        )}
      </div>
      <ComposeArea
        contact={contact}
        onSaveDraft={onSaveDraft}
        initialDraft={initialDraft}
        onDraftOpened={onDraftOpened}
      />
    </div>
  )
}
