import type { Stage, StageColor, ColorConfig, BoardConfig } from './typings'

// ─── Legacy stage config (used by OpportunityList badges) ────────────────────

export interface StageConfig {
  label: string
  probability: number
  textColor: string
  bgColor: string
  cardBorderClass: string
  columnBgClass: string
  badgeClass: string
}

export const STAGE_CONFIG: Record<Stage, StageConfig> = {
  prospecting: {
    label: 'Prospecting',
    probability: 10,
    textColor: 'text-primary',
    bgColor: 'bg-[oklch(var(--metric-blue))]',
    cardBorderClass: 'border-l-4 border-l-primary',
    columnBgClass: 'bg-primary/5',
    badgeClass: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  },
  qualification: {
    label: 'Qualification',
    probability: 25,
    textColor: 'text-[oklch(var(--warning))]',
    bgColor: 'bg-[oklch(var(--metric-orange))]',
    cardBorderClass: 'border-l-4 border-l-[oklch(var(--warning))]',
    columnBgClass: 'bg-[oklch(var(--warning))]/5',
    badgeClass: 'bg-[oklch(var(--metric-orange))] text-[oklch(var(--warning))] border-[oklch(var(--warning))]/20',
  },
  proposal: {
    label: 'Proposal',
    probability: 50,
    textColor: 'text-[oklch(var(--secondary))]',
    bgColor: 'bg-[oklch(var(--metric-purple))]',
    cardBorderClass: 'border-l-4 border-l-[oklch(var(--secondary))]',
    columnBgClass: 'bg-[oklch(var(--secondary))]/5',
    badgeClass: 'bg-[oklch(var(--metric-purple))] text-[oklch(var(--secondary))] border-[oklch(var(--secondary))]/20',
  },
  negotiation: {
    label: 'Negotiation',
    probability: 75,
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    cardBorderClass: 'border-l-4 border-l-amber-500',
    columnBgClass: 'bg-amber-500/5',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  'closed-won': {
    label: 'Closed Won',
    probability: 100,
    textColor: 'text-[oklch(var(--success))]',
    bgColor: 'bg-[oklch(var(--metric-green))]',
    cardBorderClass: 'border-l-4 border-l-[oklch(var(--success))]',
    columnBgClass: 'bg-[oklch(var(--success))]/5',
    badgeClass: 'bg-[oklch(var(--metric-green))] text-[oklch(var(--success))] border-[oklch(var(--success))]/20',
  },
  'closed-lost': {
    label: 'Closed Lost',
    probability: 0,
    textColor: 'text-destructive',
    bgColor: 'bg-[oklch(var(--metric-red))]',
    cardBorderClass: 'border-l-4 border-l-destructive',
    columnBgClass: 'bg-destructive/5',
    badgeClass: 'bg-[oklch(var(--metric-red))] text-destructive border-destructive/20',
  },
}

// ─── Color palette for board config ──────────────────────────────────────────

export const STAGE_COLORS: Record<StageColor, ColorConfig> = {
  blue: {
    dot: 'oklch(0.58 0.22 245)',
    textColor: 'text-primary',
    bgColor: 'bg-[oklch(var(--metric-blue))]',
    cardBorderClass: 'border-l-4 border-l-primary',
    columnBgClass: 'bg-primary/5',
    badgeClass: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
  },
  orange: {
    dot: 'oklch(0.7 0.2 60)',
    textColor: 'text-[oklch(var(--warning))]',
    bgColor: 'bg-[oklch(var(--metric-orange))]',
    cardBorderClass: 'border-l-4 border-l-[oklch(var(--warning))]',
    columnBgClass: 'bg-[oklch(var(--warning))]/5',
    badgeClass: 'bg-[oklch(var(--metric-orange))] text-[oklch(var(--warning))] border-[oklch(var(--warning))]/20',
  },
  purple: {
    dot: 'oklch(0.6 0.2 280)',
    textColor: 'text-[oklch(var(--secondary))]',
    bgColor: 'bg-[oklch(var(--metric-purple))]',
    cardBorderClass: 'border-l-4 border-l-[oklch(var(--secondary))]',
    columnBgClass: 'bg-[oklch(var(--secondary))]/5',
    badgeClass: 'bg-[oklch(var(--metric-purple))] text-[oklch(var(--secondary))] border-[oklch(var(--secondary))]/20',
  },
  green: {
    dot: 'oklch(0.65 0.18 150)',
    textColor: 'text-[oklch(var(--success))]',
    bgColor: 'bg-[oklch(var(--metric-green))]',
    cardBorderClass: 'border-l-4 border-l-[oklch(var(--success))]',
    columnBgClass: 'bg-[oklch(var(--success))]/5',
    badgeClass: 'bg-[oklch(var(--metric-green))] text-[oklch(var(--success))] border-[oklch(var(--success))]/20',
  },
  red: {
    dot: 'oklch(0.6 0.24 27)',
    textColor: 'text-destructive',
    bgColor: 'bg-[oklch(var(--metric-red))]',
    cardBorderClass: 'border-l-4 border-l-destructive',
    columnBgClass: 'bg-destructive/5',
    badgeClass: 'bg-[oklch(var(--metric-red))] text-destructive border-destructive/20',
  },
  amber: {
    dot: 'oklch(0.77 0.15 75)',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    cardBorderClass: 'border-l-4 border-l-amber-500',
    columnBgClass: 'bg-amber-500/5',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  gray: {
    dot: 'oklch(0.55 0 0)',
    textColor: 'text-muted-foreground',
    bgColor: 'bg-muted',
    cardBorderClass: 'border-l-4 border-l-muted-foreground/40',
    columnBgClass: 'bg-muted/40',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
}

export const PIPELINE_STAGES: Stage[] = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost',
]

const DEFAULT_STAGE_COLORS: Record<Stage, StageColor> = {
  prospecting: 'blue',
  qualification: 'orange',
  proposal: 'purple',
  negotiation: 'amber',
  'closed-won': 'green',
  'closed-lost': 'red',
}

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  stages: PIPELINE_STAGES.map((stage) => ({
    stage,
    visible: true,
    label: STAGE_CONFIG[stage].label,
    color: DEFAULT_STAGE_COLORS[stage],
  })),
  cardFields: {
    value: true,
    probability: true,
    closeDate: true,
    assignee: true,
    company: true,
  },
  columnWidth: 272,
}
