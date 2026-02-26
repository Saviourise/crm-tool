import { useState } from 'react'
import { Copy, Pencil, Trash2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { EmailTemplate, TemplateCategory } from '../typings'
import { TEMPLATE_CATEGORY_CONFIG } from '../data'

const CATEGORY_FILTER_OPTIONS: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'nurture', label: 'Nurture' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 're-engagement', label: 'Re-engagement' },
]

// ─── New Template Dialog ──────────────────────────────────────────────────────

function NewTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem('tplName') as HTMLInputElement).value
    toast.success('Template created', { description: `"${name}" has been saved.` })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Template</DialogTitle>
            <DialogDescription>Create a reusable email template for your campaigns.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tplName">Template Name *</Label>
              <Input id="tplName" name="tplName" placeholder="Follow-up After Demo" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tplSubject">Subject Line *</Label>
              <Input id="tplSubject" name="tplSubject" placeholder="Great meeting you, {{first_name}}" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tplCategory">Category</Label>
              <Select name="tplCategory" defaultValue="follow-up">
                <SelectTrigger id="tplCategory"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: EmailTemplate }) {
  const cfg = TEMPLATE_CATEGORY_CONFIG[template.category]

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
      {/* Preview strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

      <CardContent className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className={cn('text-xs font-medium', cfg.color)}>
            {cfg.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-0.5 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Options</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success('Template duplicated', { description: `"${template.name}" copied.` })}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Edit coming soon')}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => toast.error('Template deleted', { description: `"${template.name}" removed.` })}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-sm leading-snug mb-1">{template.name}</h3>
        <p className="text-xs text-primary font-medium mb-2 line-clamp-1">{template.subject}</p>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{template.preview}</p>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Used {template.usageCount} times</span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => toast.success('Template applied', { description: `Using "${template.name}" for your campaign.` })}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Main TemplateGallery ─────────────────────────────────────────────────────

export function TemplateGallery({ templates }: { templates: EmailTemplate[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [newOpen, setNewOpen] = useState(false)

  const filtered = templates.filter((t) => {
    const matchesSearch = search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
    const matchesCat = category === 'all' || t.category === category
    return matchesSearch && matchesCat
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory | 'all')}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => <TemplateCard key={t.id} template={t} />)}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or category filter.</p>
        </div>
      )}

      <NewTemplateDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  )
}
