import { Link } from 'react-router-dom'
import { Mail, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_CONTACTS } from '@/pages/contacts/data'
import { ROUTES } from '@/router/routes'

interface DealContactsCardProps {
  contactName: string
}

// Two additional mock contacts shown as "also involved"
const ALSO_INVOLVED = [
  { name: 'James Reynolds', position: 'Solutions Architect', email: 'j.reynolds@example.com' },
  { name: 'Karen White', position: 'Legal Counsel', email: 'k.white@example.com' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function DealContactsCard({ contactName }: DealContactsCardProps) {
  // Try to find the primary contact in MOCK_CONTACTS
  const foundContact = MOCK_CONTACTS.find(
    (c) => `${c.firstName} ${c.lastName}` === contactName
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Primary contact */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-semibold text-sm">Primary Contact</h3>
            <Badge variant="secondary" className="text-xs">Primary</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {getInitials(contactName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{contactName}</p>
              {foundContact?.position && (
                <p className="text-xs text-muted-foreground">{foundContact.position}</p>
              )}
              {foundContact?.email && (
                <a
                  href={`mailto:${foundContact.email}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Mail className="h-3 w-3" />
                  {foundContact.email}
                </a>
              )}
            </div>
          </div>
          <div className="mt-4">
            {foundContact ? (
              <Button size="sm" variant="outline" asChild>
                <Link to={ROUTES.CONTACT_DETAIL(foundContact.id)}>
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
        </CardContent>
      </Card>

      {/* Also involved */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-4">Also Involved</h3>
          <div className="flex flex-col gap-4">
            {ALSO_INVOLVED.map((person) => (
              <div key={person.email} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.position}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                  <a href={`mailto:${person.email}`} title={`Email ${person.name}`}>
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
