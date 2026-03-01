import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { MOCK_AUTOMATION_RULES } from '../data'
import type {
  AutomationRule, AutomationTrigger, AutomationActionType,
  AutomationCondition, AutomationAction,
} from '../typings'

// ─── Constants ─────────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  'lead-created': 'Lead Created',
  'deal-stage-changed': 'Deal Stage Changed',
  'task-overdue': 'Task Overdue',
  'contact-tag-added': 'Contact Tag Added',
  'form-submitted': 'Form Submitted',
}

const TRIGGERS: AutomationTrigger[] = [
  'lead-created', 'deal-stage-changed', 'task-overdue', 'contact-tag-added', 'form-submitted',
]

const ACTION_TYPE_LABELS: Record<AutomationActionType, string> = {
  'send-email': 'Send Email',
  'create-task': 'Create Task',
  'assign-user': 'Assign User',
  'add-tag': 'Add Tag',
  'move-deal-stage': 'Move Deal Stage',
  'send-notification': 'Send Notification',
}

const ACTION_TYPES: AutomationActionType[] = [
  'send-email', 'create-task', 'assign-user', 'add-tag', 'move-deal-stage', 'send-notification',
]

const CONDITION_FIELDS = ['source', 'priority', 'stage', 'tag', 'score', 'country']
const CONDITION_OPERATORS = ['equals', 'not equals', 'contains', 'greater than', 'less than']

// ─── Create/Edit Automation Dialog ─────────────────────────────────────────────

interface CreateAutomationDialogProps {
  open: boolean
  onClose: () => void
  onSave: (rule: Omit<AutomationRule, 'id' | 'executionsThisMonth' | 'successRate'>) => void
  initial?: AutomationRule
}

function CreateAutomationDialog({ open, onClose, onSave, initial }: CreateAutomationDialogProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState(initial?.name ?? '')
  const [trigger, setTrigger] = useState<AutomationTrigger>(initial?.trigger ?? 'lead-created')
  const [conditions, setConditions] = useState<AutomationCondition[]>(initial?.conditions ?? [])
  const [actions, setActions] = useState<AutomationAction[]>(initial?.actions ?? [{ type: 'send-email' }])

  const isEdit = !!initial

  const handleClose = () => {
    if (!isEdit) {
      setStep(1)
      setName('')
      setTrigger('lead-created')
      setConditions([])
      setActions([{ type: 'send-email' }])
    }
    onClose()
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Automation name is required.')
      return
    }
    onSave({ name: name.trim(), trigger, conditions, actions, enabled: true })
    handleClose()
  }

  const addCondition = () => {
    setConditions((prev) => [...prev, { field: 'source', operator: 'equals', value: '' }])
  }

  const removeCondition = (idx: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateCondition = (idx: number, key: keyof AutomationCondition, val: string) => {
    setConditions((prev) => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c))
  }

  const addAction = () => {
    setActions((prev) => [...prev, { type: 'send-email' }])
  }

  const removeAction = (idx: number) => {
    setActions((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateAction = (idx: number, type: AutomationActionType) => {
    setActions((prev) => prev.map((a, i) => i === idx ? { type } : a))
  }

  const STEPS = ['Trigger', 'Conditions', 'Actions']

  const ruleSummary = () => {
    const triggerLabel = TRIGGER_LABELS[trigger]
    const actionLabels = actions.map((a) => ACTION_TYPE_LABELS[a.type]).join(', ')
    return `When ${triggerLabel}, then ${actionLabels || '...'}.`
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Automation' : 'Create Automation'}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-1">
          {STEPS.map((s, idx) => (
            <span
              key={s}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                step === idx + 1
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {idx + 1}. {s}
            </span>
          ))}
        </div>

        <div className="space-y-4 py-2 min-h-[220px]">
          {/* Step 1: Trigger */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rule-name">Automation Name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g. New Lead Welcome Email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trigger-select">Trigger</Label>
                <Select value={trigger} onValueChange={(v) => setTrigger(v as AutomationTrigger)}>
                  <SelectTrigger id="trigger-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((t) => (
                      <SelectItem key={t} value={t}>{TRIGGER_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Conditions */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add optional conditions. Leave empty to run on all triggers.
              </p>
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={cond.field}
                    onValueChange={(v) => updateCondition(idx, 'field', v)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_FIELDS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={cond.operator}
                    onValueChange={(v) => updateCondition(idx, 'operator', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPERATORS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    placeholder="value"
                    value={cond.value}
                    onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeCondition(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Condition
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Actions */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Define what happens when the trigger fires.
              </p>
              {actions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={action.type}
                    onValueChange={(v) => updateAction(idx, v as AutomationActionType)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{ACTION_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {actions.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeAction(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addAction}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Action
              </Button>

              {/* Summary */}
              <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground mt-2">
                {ruleSummary()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !name.trim()}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Create Automation'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AutomationSection() {
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_AUTOMATION_RULES)
  const [createOpen, setCreateOpen] = useState(false)
  const [editRule, setEditRule] = useState<AutomationRule | null>(null)

  const activeCount = rules.filter((r) => r.enabled).length
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionsThisMonth, 0)
  const avgSuccess = rules.length
    ? Math.round(rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length)
    : 0

  const handleCreate = (data: Omit<AutomationRule, 'id' | 'executionsThisMonth' | 'successRate'>) => {
    const newRule: AutomationRule = {
      id: `ar${Date.now()}`,
      executionsThisMonth: 0,
      successRate: 100,
      ...data,
    }
    setRules((prev) => [...prev, newRule])
    toast.success(`Automation "${data.name}" created`)
  }

  const handleEdit = (data: Omit<AutomationRule, 'id' | 'executionsThisMonth' | 'successRate'>) => {
    if (!editRule) return
    setRules((prev) =>
      prev.map((r) =>
        r.id === editRule.id ? { ...r, ...data } : r
      )
    )
    toast.success(`Automation "${data.name}" updated`)
    setEditRule(null)
  }

  const handleDelete = (rule: AutomationRule) => {
    setRules((prev) => prev.filter((r) => r.id !== rule.id))
    toast.error(`Automation "${rule.name}" deleted`)
  }

  const handleToggle = (rule: AutomationRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id ? { ...r, enabled: !r.enabled } : r
      )
    )
    toast.success(rule.enabled ? `"${rule.name}" paused` : `"${rule.name}" activated`)
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground mb-1">Active Automations</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground mb-1">Executions This Month</p>
          <p className="text-2xl font-bold">{totalExecutions.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Success Rate</p>
          <p className="text-2xl font-bold">{avgSuccess}%</p>
        </div>
      </div>

      {/* Rules list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Automation Rules</CardTitle>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Automation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">No automation rules yet.</p>
            </div>
          )}
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors">
              {/* Status indicator */}
              <div className="mt-1 shrink-0">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full inline-block',
                    rule.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                  )}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{rule.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Trigger: {TRIGGER_LABELS[rule.trigger]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rule.actions.length} {rule.actions.length === 1 ? 'action' : 'actions'}
                  {' '}&middot; {rule.executionsThisMonth} executions this month
                  {' '}&middot; {rule.successRate}% success
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(rule)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                    rule.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground border-border hover:border-foreground/40'
                  )}
                >
                  {rule.enabled ? 'Active' : 'Paused'}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditRule(rule)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-600"
                  onClick={() => handleDelete(rule)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <CreateAutomationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />

      {/* Edit dialog */}
      {editRule && (
        <CreateAutomationDialog
          open={!!editRule}
          onClose={() => setEditRule(null)}
          onSave={handleEdit}
          initial={editRule}
        />
      )}
    </div>
  )
}
