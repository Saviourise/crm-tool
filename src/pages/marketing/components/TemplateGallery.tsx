import { useState, useEffect } from 'react'
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

// ─── Shared form fields ───────────────────────────────────────────────────────

interface TemplateFormFieldsProps {
  name: string; setName: (v: string) => void
  subject: string; setSubject: (v: string) => void
  category: TemplateCategory; setCategory: (v: TemplateCategory) => void
  body: string; setBody: (v: string) => void
  idPrefix: string
}

function TemplateFormFields({ name, setName, subject, setSubject, category, setCategory, body, setBody, idPrefix }: TemplateFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}Name`}>Template Name *</Label>
        <Input
          id={`${idPrefix}Name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Follow-up After Demo"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}Subject`}>Subject Line *</Label>
        <Input
          id={`${idPrefix}Subject`}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Great meeting you, {{first_name}}"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}Category`}>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
          <SelectTrigger id={`${idPrefix}Category`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}Body`}>Body *</Label>
        <textarea
          id={`${idPrefix}Body`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          required
          placeholder={`Hi {{first_name}},\n\nThank you for your interest in our platform...\n\nBest,\n{{sender_name}}`}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use <code className="bg-muted px-1 rounded">{"{{first_name}}"}</code>,{' '}
          <code className="bg-muted px-1 rounded">{"{{company}}"}</code>,{' '}
          <code className="bg-muted px-1 rounded">{"{{sender_name}}"}</code> as merge tags.
        </p>
      </div>
    </>
  )
}

// ─── New Template Dialog ──────────────────────────────────────────────────────

function NewTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('follow-up')
  const [body, setBody] = useState('')

  const handleClose = () => {
    setName(''); setSubject(''); setCategory('follow-up'); setBody('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Template created', { description: `"${name}" has been saved.` })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Template</DialogTitle>
            <DialogDescription>Create a reusable email template for your campaigns.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <TemplateFormFields
              name={name} setName={setName}
              subject={subject} setSubject={setSubject}
              category={category} setCategory={setCategory}
              body={body} setBody={setBody}
              idPrefix="new"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Save Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Template Dialog ─────────────────────────────────────────────────────

function EditTemplateDialog({ template, onClose }: { template: EmailTemplate | null; onClose: () => void }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('follow-up')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (template) {
      setName(template.name)
      setSubject(template.subject)
      setCategory(template.category)
      setBody(template.preview)
    }
  }, [template])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Template updated', { description: `"${name}" has been saved.` })
    onClose()
  }

  return (
    <Dialog open={!!template} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update your email template.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <TemplateFormFields
              name={name} setName={setName}
              subject={subject} setSubject={setSubject}
              category={category} setCategory={setCategory}
              body={body} setBody={setBody}
              idPrefix="edit"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onEdit }: { template: EmailTemplate; onEdit: (t: EmailTemplate) => void }) {
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
              <DropdownMenuItem onClick={() => onEdit(template)}>
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
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null)

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
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} onEdit={setEditTemplate} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or category filter.</p>
        </div>
      )}

      <NewTemplateDialog open={newOpen} onOpenChange={setNewOpen} />
      <EditTemplateDialog template={editTemplate} onClose={() => setEditTemplate(null)} />
    </>
  )
}
