import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/router/routes'

interface DealContactsCardProps {
  contactName: string
  contactId?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function DealContactsCard({ contactName, contactId }: DealContactsCardProps) {
  const hasContact = contactName && contactName !== '—'

  return (
    <div className="flex flex-col gap-4">
      {/* Primary contact */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-semibold text-sm">Primary Contact</h3>
            <Badge variant="secondary" className="text-xs">Primary</Badge>
          </div>
          {hasContact ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(contactName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{contactName}</p>
                </div>
              </div>
              <div className="mt-4">
                {contactId ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={ROUTES.CONTACT_DETAIL(contactId)}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Contact
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={ROUTES.CONTACTS}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Contacts
                    </Link>
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No contact linked to this deal.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
