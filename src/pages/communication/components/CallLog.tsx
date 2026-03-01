import { useState } from 'react'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Mic, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ContactThread, CallEntry, CallOutcome, MessageDirection } from '../typings'
import { getOutcomeConfig } from '../utils'

const OUTCOME_OPTIONS: { value: CallOutcome; label: string }[] = [
  { value: 'answered', label: 'Answered' },
  { value: 'no-answer', label: 'No Answer' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'busy', label: 'Busy' },
]

function CallIcon({ direction, outcome }: { direction: MessageDirection; outcome: CallOutcome }) {
  if (outcome === 'no-answer' || outcome === 'busy') {
    return <PhoneMissed className="h-4 w-4 text-destructive" />
  }
  if (direction === 'inbound') {
    return <PhoneIncoming className="h-4 w-4 text-emerald-500" />
  }
  return <PhoneOutgoing className="h-4 w-4 text-primary" />
}

interface CallLogProps {
  calls: CallEntry[]
  contact: ContactThread
}

export function CallLog({ calls, contact }: CallLogProps) {
  const [localCalls, setLocalCalls] = useState<CallEntry[]>(calls)
  const [showForm, setShowForm] = useState(false)
  const [direction, setDirection] = useState<MessageDirection>('outbound')
  const [outcome, setOutcome] = useState<CallOutcome>('answered')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  const handleLog = () => {
    const entry: CallEntry = {
      id: `call-local-${Date.now()}`,
      direction,
      duration: duration.trim() || '0m 0s',
      outcome,
      notes: notes.trim() || undefined,
      timestamp: 'Just now',
      hasRecording: false,
    }
    setLocalCalls((prev) => [entry, ...prev])
    setDirection('outbound')
    setOutcome('answered')
    setDuration('')
    setNotes('')
    setShowForm(false)
    toast.success('Call logged', { description: `${outcome === 'answered' ? 'Answered call' : outcome} with ${contact.contactName}` })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localCalls.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No calls logged yet</div>
        ) : (
          localCalls.map((call) => {
            const outcomeCfg = getOutcomeConfig(call.outcome)
            return (
              <div key={call.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <CallIcon direction={call.direction} outcome={call.outcome} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{call.direction} Call</span>
                        <Badge variant="outline" className={cn('text-xs', outcomeCfg.className)}>
                          {outcomeCfg.label}
                        </Badge>
                        {call.hasRecording && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Mic className="h-3 w-3" />
                            Recording
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {call.duration !== '0m 0s' ? `Duration: ${call.duration}` : 'No connection'} · {call.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
                {call.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 leading-relaxed">
                    {call.notes}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Log call form / button */}
      <div className="border-t">
        {showForm ? (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Log a Call</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Direction</Label>
                <Select value={direction} onValueChange={(v) => setDirection(v as MessageDirection)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Outcome</Label>
                <Select value={outcome} onValueChange={(v) => setOutcome(v as CallOutcome)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OUTCOME_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Duration (e.g. 5m 30s)</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="5m 30s"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Call Notes</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Summarise what was discussed…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={handleLog}>
                <Phone className="h-3.5 w-3.5" />
                Save Call
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              Log a Call
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
