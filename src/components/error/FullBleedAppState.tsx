import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type FullBleedAppStateProps = {
  variant: 'embedded' | 'fullscreen'
  /** Large background text (e.g. "404", "!") */
  watermark: string
  label: ReactNode
  title: ReactNode
  description: ReactNode
  actions: ReactNode
}

export function FullBleedAppState({
  variant,
  watermark,
  label,
  title,
  description,
  actions,
}: FullBleedAppStateProps) {
  const embedded = variant === 'embedded'
  const watermarkSize =
    watermark.length <= 2
      ? 'clamp(11rem, 36vmin, 26rem)'
      : 'clamp(7rem, 28vmin, 20rem)'

  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden',
        embedded &&
          cn(
            '-mx-4 -mt-4 -mb-4 min-h-[calc(100dvh-3.5rem)] w-auto',
            'md:-mx-6 md:-mt-6 md:-mb-6 md:min-h-[calc(100dvh-4.0625rem)]',
            'lg:-mx-8 lg:-mt-8 lg:-mb-8'
          ),
        !embedded && 'min-h-dvh'
      )}
    >
      <div className="absolute inset-0 bg-background" aria-hidden />

      <div
        className="absolute inset-0 bg-linear-to-b from-primary/12 via-transparent to-secondary/8 dark:from-primary/18 dark:to-secondary/12"
        aria-hidden
      />
      <div
        className="absolute -right-1/4 top-0 h-[min(70vh,560px)] w-[min(90vw,560px)] rounded-full bg-primary/7 blur-3xl dark:bg-primary/12"
        aria-hidden
      />
      <div
        className="absolute -left-1/4 bottom-0 h-[min(50vh,420px)] w-[min(70vw,420px)] rounded-full bg-secondary/8 blur-3xl dark:bg-secondary/14"
        aria-hidden
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-size-[44px_44px] opacity-[0.45] dark:opacity-[0.28]',
          'bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]'
        )}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden pb-6 md:justify-end md:pb-10 md:pr-4 lg:pr-10"
        aria-hidden
      >
        <span
          className="translate-x-0 translate-y-[18%] select-none font-bold leading-none tracking-tighter text-foreground/4.5 dark:text-foreground/8 md:translate-x-[6%] md:translate-y-[22%]"
          style={{ fontSize: watermarkSize }}
        >
          {watermark}
        </span>
      </div>

      <div
        className="pointer-events-none absolute right-[6%] top-1/2 hidden -translate-y-1/2 lg:block"
        aria-hidden
      >
        <div className="relative size-[min(38vmin,340px)]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary/20 dark:border-primary/30"
              style={{ inset: `${i * 9}%` }}
            />
          ))}
          <div className="absolute inset-[36%] rounded-full bg-linear-to-br from-primary/25 to-secondary/20 blur-sm dark:from-primary/35 dark:to-secondary/25" />
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-14 md:px-10 md:py-16 lg:px-14">
        <div className="max-w-xl">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{label}</div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">{actions}</div>
        </div>
      </div>
    </div>
  )
}
