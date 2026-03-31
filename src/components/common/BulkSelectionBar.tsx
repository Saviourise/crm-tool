import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkSelectionBarProps {
  count: number
  label: string
  onClear: () => void
  children?: ReactNode
}

export function BulkSelectionBar({ count, label, onClear, children }: BulkSelectionBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground animate-in slide-in-from-top-2 duration-200">
      <span className="text-sm font-medium tabular-nums shrink-0">
        {count} {label} selected
      </span>
      <div className="h-4 w-px bg-primary-foreground/25" />
      {children}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/15 shrink-0 ml-auto"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
