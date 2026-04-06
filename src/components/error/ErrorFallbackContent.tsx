import { Link } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FullBleedAppState } from '@/components/error/FullBleedAppState'
import { ROUTES } from '@/router/routes'

type ErrorFallbackContentProps = {
  variant: 'fullscreen' | 'embedded'
  onRetry: () => void
}

export function ErrorFallbackContent({ variant, onRetry }: ErrorFallbackContentProps) {
  const dashboardButton =
    variant === 'fullscreen' ? (
      <Button asChild size="lg" className="rounded-full px-7">
        <a href={ROUTES.DASHBOARD}>
          <Home className="size-4" />
          Back to dashboard
        </a>
      </Button>
    ) : (
      <Button asChild size="lg" className="rounded-full px-7">
        <Link to={ROUTES.DASHBOARD}>
          <Home className="size-4" />
          Back to dashboard
        </Link>
      </Button>
    )

  return (
    <FullBleedAppState
      variant={variant}
      watermark="!"
      label={
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          Unexpected hiccup
        </span>
      }
      title="Something went wrong"
      description="An unexpected error occurred while rendering this view. You can try loading it again or return to the dashboard."
      actions={
        <>
          <Button type="button" variant="outline" size="lg" className="rounded-full px-6" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
          {dashboardButton}
        </>
      }
    />
  )
}
