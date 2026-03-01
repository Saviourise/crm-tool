import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ContactThread, NoteEntry } from '../typings'
import { renderWithMentions } from '../utils'

interface NotesProps {
  notes: NoteEntry[]
  contact: ContactThread
}

function NoteBody({ body }: { body: string }) {
  const segments = renderWithMentions(body)
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg) =>
        seg.type === 'mention' ? (
          <span key={seg.key} className="text-primary font-medium">
            {seg.value}
          </span>
        ) : (
          <span key={seg.key}>{seg.value}</span>
        )
      )}
    </p>
  )
}

export function Notes({ notes, contact }: NotesProps) {
  const [localNotes, setLocalNotes] = useState<NoteEntry[]>(notes)
  const [body, setBody] = useState('')

  const handlePost = () => {
    if (!body.trim()) return
    const entry: NoteEntry = {
      id: `note-local-${Date.now()}`,
      body: body.trim(),
      author: 'You',
      authorInitials: 'YO',
      timestamp: 'Just now',
    }
    setLocalNotes((prev) => [entry, ...prev])
    setBody('')
    toast.success('Note added', { description: `Note saved for ${contact.contactName}` })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localNotes.length === 0 ? (
          <div className="py-12 text-center">
            <StickyNote className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notes yet</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Add internal notes and @mention teammates</p>
          </div>
        ) : (
          localNotes.map((note) => (
            <div key={note.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                  {note.authorInitials}
                </div>
                <span className="text-xs font-medium">{note.author}</span>
                <span className="text-xs text-muted-foreground ml-auto">{note.timestamp}</span>
              </div>
              <NoteBody body={note.body} />
            </div>
          ))
        )}
      </div>

      {/* Compose area */}
      <div className="border-t p-3 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add a note… Use @name to mention a teammate"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Use @name to mention a teammate</p>
          <Button size="sm" className="h-7 text-xs" onClick={handlePost} disabled={!body.trim()}>
            Post Note
          </Button>
        </div>
      </div>
    </div>
  )
}
