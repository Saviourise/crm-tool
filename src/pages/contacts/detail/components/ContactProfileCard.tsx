import { Mail, Phone, Linkedin, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Contact } from '../../typings'
import { SentimentBadge } from './SentimentBadge'

interface ContactProfileCardProps {
  contact: Contact
}

const statusStyles: Record<Contact['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  prospect: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  inactive: 'bg-muted text-muted-foreground border-border',
}

export function ContactProfileCard({ contact }: ContactProfileCardProps) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar + name block */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold leading-tight">
                  {contact.firstName} {contact.lastName}
                </h1>
                <Badge
                  variant="outline"
                  className={cn('capitalize text-xs font-medium', statusStyles[contact.status])}
                >
                  {contact.status}
                </Badge>
              </div>
              {(contact.position || contact.company) && (
                <p className="text-muted-foreground text-sm mb-3">
                  {contact.position}
                  {contact.position && contact.company ? ' at ' : ''}
                  {contact.company}
                </p>
              )}

              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <SentimentBadge contactId={contact.id} />
            </div>
          </div>

          {/* Info grid */}
          <div className="flex flex-col gap-2.5 sm:min-w-[240px]">
            {contact.email && (
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <Link
                  to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=email`}
                  className="text-primary hover:underline truncate"
                >
                  {contact.email}
                </Link>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <Link
                  to={`/communication?contactId=${contact.id}&name=${encodeURIComponent(`${contact.firstName} ${contact.lastName}`)}&tab=call`}
                  className="hover:text-primary"
                >
                  {contact.phone}
                </Link>
              </div>
            )}
            {contact.linkedin && (
              <div className="flex items-center gap-2.5 text-sm">
                <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={`https://${contact.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {contact.linkedin}
                </a>
              </div>
            )}
            {contact.twitter && (
              <div className="flex items-center gap-2.5 text-sm">
                <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{contact.twitter}</span>
              </div>
            )}
            <div className="pt-1 border-t border-border mt-1 flex flex-col gap-1.5">
              {contact.lastContacted && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last Contacted</span>
                  <span className="font-medium">{contact.lastContacted}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{contact.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
