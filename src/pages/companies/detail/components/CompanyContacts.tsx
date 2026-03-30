import { useQuery } from '@tanstack/react-query'
import { Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { companiesApi } from '@/api/companies'
import { mapApiContactToContact } from '@/pages/contacts/apiMappers'
import { ROUTES } from '@/router/routes'

interface CompanyContactsProps {
  companyId: string
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  prospect: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  inactive: 'bg-muted text-muted-foreground border-border',
}

export function CompanyContacts({ companyId }: CompanyContactsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['companies', companyId, 'contacts'],
    queryFn: () => companiesApi.contacts(companyId),
  })

  const raw = data?.data
  const rawResults = Array.isArray(raw) ? raw : (raw?.results ?? [])
  const contacts = rawResults.map(mapApiContactToContact)

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-base font-medium">No contacts found for this company</p>
        <p className="text-sm mt-1">Add contacts and link them to this company to see them here.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contacts.map((contact) => {
        const initials = `${contact.firstName[0]}${contact.lastName[0]}`
        return (
          <Card key={contact.id}>
            <CardContent className="p-4 flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={ROUTES.CONTACT_DETAIL(contact.id)}
                    className="text-sm font-medium truncate hover:text-primary hover:underline"
                  >
                    {contact.firstName} {contact.lastName}
                  </Link>
                  <Badge
                    variant="outline"
                    className={`capitalize text-xs shrink-0 ${statusStyles[contact.status] ?? ''}`}
                  >
                    {contact.status}
                  </Badge>
                </div>
                {contact.position && (
                  <p className="text-xs text-muted-foreground mt-0.5">{contact.position}</p>
                )}
                <div className="flex flex-col gap-1 mt-2">
                  <Link
                    to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=email`}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </Link>
                  {contact.phone && (
                    <Link
                      to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=call`}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{contact.phone}</span>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
