import { FileText, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EmailDraft } from '../typings'

interface DraftsViewProps {
  drafts: EmailDraft[]
  onEdit: (draft: EmailDraft) => void
  onDelete: (id: string) => void
}

export function DraftsView({ drafts, onEdit, onDelete }: DraftsViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b shrink-0">
        <h2 className="text-sm font-semibold">Drafts</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {drafts.length === 0
            ? 'No saved drafts'
            : `${drafts.length} unsent draft${drafts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Draft list */}
      <div className="flex-1 overflow-y-auto p-4">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">No drafts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              When you save an email as a draft, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-lg border p-3 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {/* Contact avatar */}
                  <div
                    className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0',
                      draft.avatarColor
                    )}
                  >
                    {draft.contactInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate">{draft.contactName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{draft.savedAt}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground/80 truncate mb-1">
                      {draft.subject || <span className="italic text-muted-foreground">(no subject)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {draft.body || <span className="italic">(no content)</span>}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                    onClick={() => onDelete(draft.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => onEdit(draft)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Draft
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
