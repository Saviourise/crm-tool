import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCENT_ICON: Record<
  'primary' | 'success' | 'warning' | 'secondary' | 'destructive' | 'muted',
  string
> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  secondary: 'bg-primary/15 text-primary/50',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
}

export type StatCardAccent = keyof typeof ACCENT_ICON

export function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  accent = 'primary',
  className,
}: {
  icon: LucideIcon
  value: React.ReactNode
  label: string
  sub?: string
  accent?: StatCardAccent
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-surface flex flex-col rounded-2xl border border-border/50 p-5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn('rounded-lg p-2', ACCENT_ICON[accent])}>
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-text-secondary">{label}</p>
      {sub ? <p className="mt-0.5 text-xs text-text-muted">{sub}</p> : null}
    </div>
  )
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-surface flex flex-col rounded-2xl border border-border/50 p-5',
        className
      )}
    >
      <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
      <div className="mt-3 h-9 w-20 rounded-md bg-muted animate-pulse" />
      <div className="mt-2 h-4 w-28 rounded bg-muted animate-pulse" />
    </div>
  )
}
