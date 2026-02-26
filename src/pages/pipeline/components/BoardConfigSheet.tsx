import { useState } from 'react'
import { Eye, EyeOff, ChevronUp, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { STAGE_COLORS, DEFAULT_BOARD_CONFIG } from '../data'
import type { BoardConfig, CardFieldSettings, StageColor } from '../typings'

// ─── Inline toggle (no extra dependency) ─────────────────────────────────────

function Toggle({ checked, onChange, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        checked ? 'bg-primary' : 'bg-input'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

// ─── Color swatch picker ──────────────────────────────────────────────────────

const COLOR_KEYS = Object.keys(STAGE_COLORS) as StageColor[]

const COLOR_LABELS: Record<StageColor, string> = {
  blue: 'Blue',
  orange: 'Orange',
  purple: 'Purple',
  green: 'Green',
  red: 'Red',
  amber: 'Amber',
  gray: 'Gray',
}

function ColorPicker({ value, onChange }: {
  value: StageColor
  onChange: (color: StageColor) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      {COLOR_KEYS.map((color) => (
        <button
          key={color}
          type="button"
          title={COLOR_LABELS[color]}
          onClick={() => onChange(color)}
          className={cn(
            'h-5 w-5 rounded-full transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === color
              ? 'ring-2 ring-offset-1 ring-foreground scale-110'
              : 'ring-1 ring-transparent ring-offset-0'
          )}
          style={{ backgroundColor: STAGE_COLORS[color].dot }}
        />
      ))}
    </div>
  )
}

// ─── Tab navigation ───────────────────────────────────────────────────────────

type ConfigTab = 'Stages' | 'Cards' | 'Display'
const CONFIG_TABS: ConfigTab[] = ['Stages', 'Cards', 'Display']

// ─── Column width options ─────────────────────────────────────────────────────

const WIDTH_OPTIONS = [
  { label: 'Compact', sub: '240px', value: 240 },
  { label: 'Default', sub: '272px', value: 272 },
  { label: 'Wide', sub: '320px', value: 320 },
]

// ─── Card field options ───────────────────────────────────────────────────────

const CARD_FIELDS: { field: keyof CardFieldSettings; label: string; description: string }[] = [
  { field: 'value', label: 'Deal Value', description: 'Show the estimated deal value' },
  { field: 'probability', label: 'Probability Bar', description: 'Show win probability as a progress bar' },
  { field: 'closeDate', label: 'Expected Close Date', description: 'Show the target close date' },
  { field: 'assignee', label: 'Assigned To', description: 'Show the assignee avatar' },
  { field: 'company', label: 'Company', description: 'Show company below the deal name' },
]

// ─── Main BoardConfigSheet ────────────────────────────────────────────────────

interface BoardConfigSheetProps {
  config: BoardConfig
  onConfigChange: (config: BoardConfig) => void
  trigger: React.ReactNode
}

export function BoardConfigSheet({ config, onConfigChange, trigger }: BoardConfigSheetProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('Stages')

  // ── Stage helpers ──────────────────────────────────────────────────────────

  const updateStage = (index: number, patch: Partial<BoardConfig['stages'][number]>) => {
    const stages = config.stages.map((s, i) => (i === index ? { ...s, ...patch } : s))
    onConfigChange({ ...config, stages })
  }

  const moveStage = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= config.stages.length) return
    const stages = [...config.stages]
    ;[stages[index], stages[next]] = [stages[next], stages[index]]
    onConfigChange({ ...config, stages })
  }

  // ── Card field helpers ─────────────────────────────────────────────────────

  const updateCardField = (field: keyof CardFieldSettings, value: boolean) => {
    onConfigChange({ ...config, cardFields: { ...config.cardFields, [field]: value } })
  }

  const visibleCount = config.stages.filter((s) => s.visible).length

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[420px] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Board Settings
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Customize how your pipeline board looks and behaves.
          </p>
        </SheetHeader>

        {/* Tab nav */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex gap-0.5 p-1 bg-muted rounded-lg">
            {CONFIG_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 text-sm py-1.5 rounded-md font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {/* ── STAGES TAB ── */}
          {activeTab === 'Stages' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {visibleCount} of {config.stages.length} stages visible. Reorder, rename, and change accent colors.
              </p>

              {config.stages.map((settings, index) => (
                <div
                  key={settings.stage}
                  className={cn(
                    'rounded-xl border bg-card p-3 space-y-2.5 transition-all',
                    !settings.visible && 'opacity-50 bg-muted/20'
                  )}
                >
                  {/* Row: controls */}
                  <div className="flex items-center gap-2">
                    {/* Up / Down */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveStage(index, -1)}
                        disabled={index === 0}
                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStage(index, 1)}
                        disabled={index === config.stages.length - 1}
                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Color picker */}
                    <div className="flex-1">
                      <ColorPicker
                        value={settings.color}
                        onChange={(color) => updateStage(index, { color })}
                      />
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Visibility toggle */}
                    <button
                      type="button"
                      onClick={() => updateStage(index, { visible: !settings.visible })}
                      title={settings.visible ? 'Hide column' : 'Show column'}
                      className={cn(
                        'h-7 w-7 rounded-md flex items-center justify-center transition-colors',
                        settings.visible
                          ? 'text-foreground hover:bg-muted'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {settings.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Row: label rename */}
                  <Input
                    value={settings.label}
                    onChange={(e) => updateStage(index, { label: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="Stage name"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── CARDS TAB ── */}
          {activeTab === 'Cards' && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground mb-4">
                Choose which fields are displayed on each deal card.
              </p>
              {CARD_FIELDS.map(({ field, label, description }) => (
                <div
                  key={field}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="mr-4">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Toggle
                    checked={config.cardFields[field]}
                    onChange={(v) => updateCardField(field, v)}
                    label={`Toggle ${label}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── DISPLAY TAB ── */}
          {activeTab === 'Display' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-1">Column Width</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Adjust how wide each pipeline column appears on the board.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {WIDTH_OPTIONS.map(({ label, sub, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onConfigChange({ ...config, columnWidth: value })}
                      className={cn(
                        'flex flex-col items-center py-3 rounded-xl border text-sm font-medium transition-all',
                        config.columnWidth === value
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'hover:bg-muted border-border text-foreground'
                      )}
                    >
                      {label}
                      <span className={cn(
                        'text-xs mt-0.5 font-normal',
                        config.columnWidth === value ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-1">Visible Stages</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Quick-toggle stage visibility without leaving this tab.
                </p>
                <div className="space-y-2">
                  {config.stages.map((settings, index) => {
                    const color = STAGE_COLORS[settings.color]
                    return (
                      <div key={settings.stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color.dot }}
                          />
                          <span className="text-sm">{settings.label}</span>
                        </div>
                        <Toggle
                          checked={settings.visible}
                          onChange={(v) => updateStage(index, { visible: v })}
                          label={`Toggle ${settings.label}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => onConfigChange(DEFAULT_BOARD_CONFIG)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
