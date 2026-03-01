import { useState } from 'react'
import {
  Type, Hash, List, Calendar, ToggleLeft, Phone, Mail,
  Plus, Pencil, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { MOCK_CUSTOM_FIELDS } from '../data'
import type { CustomField, FieldType, FieldEntity } from '../typings'

// ─── Icon map ──────────────────────────────────────────────────────────────────

const FIELD_TYPE_ICONS: Record<FieldType, React.ElementType> = {
  text:    Type,
  number:  Hash,
  select:  List,
  date:    Calendar,
  boolean: ToggleLeft,
  phone:   Phone,
  email:   Mail,
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text:    'Text',
  number:  'Number',
  select:  'Select',
  date:    'Date',
  boolean: 'Boolean',
  phone:   'Phone',
  email:   'Email',
}

const ENTITY_TABS: { id: FieldEntity; label: string }[] = [
  { id: 'contacts', label: 'Contacts' },
  { id: 'leads',    label: 'Leads'    },
  { id: 'deals',    label: 'Deals'    },
  { id: 'tasks',    label: 'Tasks'    },
]

const FIELD_TYPES: FieldType[] = ['text', 'number', 'select', 'date', 'boolean', 'phone', 'email']

// ─── Field Dialog ──────────────────────────────────────────────────────────────

interface FieldDialogProps {
  open: boolean
  onClose: () => void
  onSave: (field: Omit<CustomField, 'id'>) => void
  entity: FieldEntity
  initial?: CustomField
}

function FieldDialog({ open, onClose, onSave, entity, initial }: FieldDialogProps) {
  const [label, setLabel]     = useState(initial?.label ?? '')
  const [type, setType]       = useState<FieldType>(initial?.type ?? 'text')
  const [required, setRequired] = useState(initial?.required ?? false)
  const [options, setOptions] = useState(initial?.options?.join(', ') ?? '')

  const isEdit = !!initial

  const handleClose = () => {
    if (!isEdit) {
      setLabel('')
      setType('text')
      setRequired(false)
      setOptions('')
    }
    onClose()
  }

  const handleSave = () => {
    if (!label.trim()) {
      toast.error('Field label is required.')
      return
    }
    onSave({
      label:    label.trim(),
      type,
      entity,
      required,
      options:  type === 'select' ? options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
    })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the field configuration.' : 'Define a new custom field for this entity.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="field-label">Label</Label>
            <Input
              id="field-label"
              placeholder="e.g. Budget Range, LinkedIn URL"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="field-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as FieldType)}>
              <SelectTrigger id="field-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{FIELD_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'select' && (
            <div className="space-y-1.5">
              <Label htmlFor="field-options">Options</Label>
              <Input
                id="field-options"
                placeholder="e.g. Option A, Option B, Option C"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRequired((v) => !v)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                required
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
              )}
            >
              {required ? 'Required' : 'Optional'}
            </button>
            <span className="text-sm text-muted-foreground">
              {required ? 'This field must be filled in.' : 'This field is optional.'}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add Field'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CustomFieldsSection() {
  const [activeEntity, setActiveEntity] = useState<FieldEntity>('contacts')
  const [fields, setFields]             = useState<CustomField[]>(MOCK_CUSTOM_FIELDS)
  const [addOpen, setAddOpen]           = useState(false)
  const [editField, setEditField]       = useState<CustomField | null>(null)

  const visibleFields = fields.filter((f) => f.entity === activeEntity)

  const handleAdd = (data: Omit<CustomField, 'id'>) => {
    const newField: CustomField = { id: `cf${Date.now()}`, ...data }
    setFields((prev) => [...prev, newField])
    toast.success(`Field "${data.label}" added`)
  }

  const handleEdit = (data: Omit<CustomField, 'id'>) => {
    if (!editField) return
    setFields((prev) =>
      prev.map((f) => f.id === editField.id ? { ...f, ...data } : f)
    )
    toast.success(`Field "${data.label}" updated`)
    setEditField(null)
  }

  const handleDelete = (field: CustomField) => {
    setFields((prev) => prev.filter((f) => f.id !== field.id))
    toast.error(`Field "${field.label}" deleted`)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Custom Fields</CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Entity Tabs */}
          <div className="border-b flex gap-4 mb-4 overflow-x-auto">
            {ENTITY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveEntity(tab.id)}
                className={cn(
                  'pb-2 border-b-2 text-sm font-medium transition-colors cursor-pointer',
                  activeEntity === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({fields.filter((f) => f.entity === tab.id).length})
                </span>
              </button>
            ))}
          </div>

          {/* Fields Table */}
          {visibleFields.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Type className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No custom fields for this entity yet.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add the first field
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Label</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Required</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleFields.map((field, idx) => {
                    const Icon = FIELD_TYPE_ICONS[field.type]
                    return (
                      <tr
                        key={field.id}
                        className={cn('border-b last:border-0 hover:bg-muted/20 transition-colors', idx % 2 === 0 ? '' : '')}
                      >
                        <td className="px-4 py-3 font-medium">{field.label}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {FIELD_TYPE_LABELS[field.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {field.required ? (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              Optional
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setEditField(field)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-600"
                              onClick={() => handleDelete(field)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <FieldDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        entity={activeEntity}
      />

      {/* Edit Dialog */}
      {editField && (
        <FieldDialog
          open={!!editField}
          onClose={() => setEditField(null)}
          onSave={handleEdit}
          entity={editField.entity}
          initial={editField}
        />
      )}
    </div>
  )
}
