import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FullBleedAppState } from '@/components/error/FullBleedAppState'
import { ROUTES } from '@/router/routes'

export default function NotFoundPage() {
  return (
    <FullBleedAppState
      variant="embedded"
      watermark="404"
      label={
        <span className="flex items-center gap-2">
          <Compass className="size-3.5 shrink-0" aria-hidden />
          Off the map
        </span>
      }
      title="Nothing lives at this address"
      description="The link may be wrong, the page was removed, or your workspace role cannot open it. Head home or step back to where you were."
      actions={
        <>
          <Button asChild size="lg" className="rounded-full px-7">
            <Link to={ROUTES.DASHBOARD}>
              <Home className="size-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-full px-6"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        </>
      }
    />
  )
}
