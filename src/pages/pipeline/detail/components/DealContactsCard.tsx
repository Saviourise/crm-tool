import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { pipelineApi } from '@/api/pipeline'
import { contactsApi } from '@/api/contacts'
import { ROUTES } from '@/router/routes'
import { PIPELINE_DEALS_QUERY_KEY, pipelineQueryKeys } from '../../queryKeys'

interface DealContactsCardProps {
  dealId: string
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

// ─── Add Contact Dialog ───────────────────────────────────────────────────────

function AddContactDialog({ dealId, open, onOpenChange }: { dealId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')

  const { data: contactsRes, isLoading } = useQuery({
    queryKey: ['contacts', 'search', search],
    queryFn: () => contactsApi.list({ search, limit: 20 }),
    enabled: open,
  })

  const contacts = contactsRes?.data?.results ?? []

  const linkContact = useMutation({
    mutationFn: (contactId: string) =>
      pipelineApi.updateDeal(dealId, { contact: contactId } as Parameters<typeof pipelineApi.updateDeal>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.dealContacts(dealId) })
      queryClient.invalidateQueries({ queryKey: [...PIPELINE_DEALS_QUERY_KEY, dealId] })
      queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.dealDetail(dealId) })
      toast.success('Contact linked to deal')
      handleClose()
    },
    onError: () => {
      toast.error('Failed to link contact')
    },
  })

  const handleClose = () => {
    setSearch('')
    setSelectedId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Link Contact</DialogTitle>
          <DialogDescription>Search for a contact to link to this deal.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedId('') }}
              className="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto flex flex-col gap-1">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && contacts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No contacts found.</p>
            )}
            {contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  selectedId === c.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(c.first_name, c.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            type="button"
            disabled={!selectedId || linkContact.isPending}
            onClick={() => linkContact.mutate(selectedId)}
          >
            {linkContact.isPending ? 'Linking…' : 'Link Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function DealContactsCard({ dealId }: DealContactsCardProps) {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)

  const { data: contactsRes, isLoading } = useQuery({
    queryKey: pipelineQueryKeys.dealContacts(dealId),
    queryFn: () => pipelineApi.dealContacts(dealId),
    enabled: !!dealId,
  })

  const dealContacts = contactsRes?.data?.results ?? []

  const unlinkContact = useMutation({
    mutationFn: () =>
      pipelineApi.updateDeal(dealId, { contact: null } as Parameters<typeof pipelineApi.updateDeal>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.dealContacts(dealId) })
      queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.dealDetail(dealId) })
      toast.success('Contact unlinked')
    },
    onError: () => {
      toast.error('Failed to unlink contact')
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Contacts</h3>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Link Contact
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && dealContacts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No contacts linked to this deal.</p>
          </CardContent>
        </Card>
      )}

      {dealContacts.map((dc) => (
        <Card key={dc.contact.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Badge variant="secondary" className="text-xs capitalize">{dc.role}</Badge>
              <button
                type="button"
                onClick={() => unlinkContact.mutate()}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Unlink contact"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                {dc.contact.avatar_url ? (
                  <img src={dc.contact.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(dc.contact.first_name, dc.contact.last_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{dc.contact.first_name} {dc.contact.last_name}</p>
                {dc.contact.position && <p className="text-xs text-muted-foreground">{dc.contact.position}</p>}
                <p className="text-xs text-muted-foreground">{dc.contact.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link to={ROUTES.CONTACT_DETAIL(dc.contact.id)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Contact
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <AddContactDialog dealId={dealId} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
