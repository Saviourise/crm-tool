import { useState } from 'react'
import { RotateCcw, Map, BarChart2, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { DEFAULT_LEAD_ROUTING } from '../data'
import type { RoutingMethod, RoutingMember, TerritoryRule, ScoreTier } from '../typings'

// ─── Method cards config ───────────────────────────────────────────────────────

const METHOD_OPTIONS: {
  id: RoutingMethod
  label: string
  description: string
  icon: React.ElementType
}[] = [
    {
      id: 'round-robin',
      label: 'Round Robin',
      description: 'Distribute leads evenly in rotation',
      icon: RotateCcw,
    },
    {
      id: 'territory',
      label: 'Territory-Based',
      description: 'Route based on geography or domain',
      icon: Map,
    },
    {
      id: 'score',
      label: 'Score-Based',
      description: 'Assign by lead score threshold',
      icon: BarChart2,
    },
  ]

const TERRITORY_FIELDS = ['country', 'state', 'city', 'domain', 'industry']
const TERRITORY_OPERATORS = ['equals', 'not equals', 'contains', 'starts with', 'ends with']

// ─── Round Robin View ──────────────────────────────────────────────────────────

function RoundRobinView({
  members,
  setMembers,
}: {
  members: RoutingMember[]
  setMembers: React.Dispatch<React.SetStateAction<RoutingMember[]>>
}) {
  const activeMembers = members.filter((m) => m.active)
  const nextAssignee = activeMembers[0]?.name ?? 'No active members'

  const toggleMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => m.id === id ? { ...m, active: !m.active } : m)
    )
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setMembers((prev) => {
      const arr = [...prev]
        ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      return arr
    })
  }

  const moveDown = (idx: number) => {
    setMembers((prev) => {
      if (idx === prev.length - 1) return prev
      const arr = [...prev]
        ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      return arr
    })
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        Next assignment: <span className="font-medium text-foreground">{nextAssignee}</span>
      </div>

      <div className="space-y-2">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/20 transition-colors"
          >
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <span className="text-sm font-medium truncate">{member.name}</span>
              {member.active ? (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 shrink-0">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs text-muted-foreground shrink-0">
                  Inactive
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => toggleMember(member.id)}
              >
                {member.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => moveDown(idx)}
                disabled={idx === members.length - 1}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Territory View ────────────────────────────────────────────────────────────

function TerritoryView({
  rules,
  setRules,
}: {
  rules: TerritoryRule[]
  setRules: React.Dispatch<React.SetStateAction<TerritoryRule[]>>
}) {
  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: `tr${Date.now()}`, field: 'country', operator: 'equals', value: '', assignedTo: '' },
    ])
  }

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRule = (id: string, key: keyof TerritoryRule, val: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, [key]: val } : r))
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Field</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Operator</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Value</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Assigned To</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                  No territory rules defined.
                </td>
              </tr>
            )}
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <Select
                    value={rule.field}
                    onValueChange={(v) => updateRule(rule.id, 'field', v)}
                  >
                    <SelectTrigger className="h-8 text-xs w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TERRITORY_FIELDS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={rule.operator}
                    onValueChange={(v) => updateRule(rule.id, 'operator', v)}
                  >
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TERRITORY_OPERATORS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    className="h-8 text-xs w-28"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                    placeholder="e.g. USA"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    className="h-8 text-xs w-32"
                    value={rule.assignedTo}
                    onChange={(e) => updateRule(rule.id, 'assignedTo', e.target.value)}
                    placeholder="Assignee name"
                  />
                </td>
                <td className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" variant="outline" onClick={addRule}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add Rule
      </Button>
    </div>
  )
}

// ─── Score-Based View ──────────────────────────────────────────────────────────

function ScoreView({
  tiers,
  setTiers,
}: {
  tiers: ScoreTier[]
  setTiers: React.Dispatch<React.SetStateAction<ScoreTier[]>>
}) {
  const addTier = () => {
    setTiers((prev) => [...prev, { id: `st${Date.now()}`, minScore: 0, assignTo: '' }])
  }

  const removeTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTier = <K extends keyof ScoreTier>(id: string, key: K, val: ScoreTier[K]) => {
    setTiers((prev) => prev.map((t) => t.id === id ? { ...t, [key]: val } : t))
  }

  return (
    <div className="space-y-3">
      {tiers.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">No score tiers configured.</p>
      )}
      {tiers.map((tier) => (
        <div key={tier.id} className="flex items-center gap-3 p-3 rounded-lg border">
          <span className="text-sm text-muted-foreground shrink-0">Score</span>
          <span className="text-sm font-medium shrink-0">&#8805;</span>
          <Input
            type="number"
            className="h-8 w-20 text-sm"
            value={tier.minScore}
            onChange={(e) => updateTier(tier.id, 'minScore', Number(e.target.value))}
            min={0}
            max={100}
          />
          <span className="text-sm text-muted-foreground shrink-0">assign to</span>
          <Input
            className="h-8 flex-1 text-sm"
            placeholder="Assignee name"
            value={tier.assignTo}
            onChange={(e) => updateTier(tier.id, 'assignTo', e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-rose-500 hover:text-rose-600 shrink-0"
            onClick={() => removeTier(tier.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addTier}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add Tier
      </Button>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function LeadRoutingSection() {
  const [method, setMethod] = useState<RoutingMethod>(DEFAULT_LEAD_ROUTING.method)
  const [members, setMembers] = useState<RoutingMember[]>(DEFAULT_LEAD_ROUTING.members)
  const [rules, setRules] = useState<TerritoryRule[]>(DEFAULT_LEAD_ROUTING.territoryRules)
  const [tiers, setTiers] = useState<ScoreTier[]>(DEFAULT_LEAD_ROUTING.scoreTiers)

  const handleSave = () => {
    toast.success('Lead routing settings saved')
  }

  return (
    <div className="space-y-6">
      {/* Method selection */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Method</CardTitle>
          <CardDescription>Choose how incoming leads are distributed across your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {METHOD_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const selected = method === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={cn(
                    'flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-colors',
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <Icon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <p className={cn('text-sm font-semibold', selected ? 'text-foreground' : 'text-muted-foreground')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Method-specific config */}
      <Card>
        <CardHeader>
          <CardTitle>
            {method === 'round-robin' && 'Team Members'}
            {method === 'territory' && 'Territory Rules'}
            {method === 'score' && 'Score Tiers'}
          </CardTitle>
          <CardDescription>
            {method === 'round-robin' && 'Set the rotation order and activate or deactivate members.'}
            {method === 'territory' && 'Define rules to route leads based on field values.'}
            {method === 'score' && 'Assign leads based on their score threshold.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {method === 'round-robin' && (
            <RoundRobinView members={members} setMembers={setMembers} />
          )}
          {method === 'territory' && (
            <TerritoryView rules={rules} setRules={setRules} />
          )}
          {method === 'score' && (
            <ScoreView tiers={tiers} setTiers={setTiers} />
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
