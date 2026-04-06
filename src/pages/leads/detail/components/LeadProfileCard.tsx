import { Mail, Phone, User, Calendar, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/router/routes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '../../typings'

interface LeadProfileCardProps {
  lead: Lead
}

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  unqualified: 'bg-muted text-muted-foreground border-border',
  converted: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
  lost: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
}

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  unqualified: 'Unqualified',
  converted: 'Converted',
  lost: 'Lost',
}

const sourceLabels: Record<string, string> = {
  website: 'Website',
  referral: 'Referral',
  social: 'Social Media',
  email: 'Email',
  phone: 'Phone',
  event: 'Event',
  other: 'Other',
}

function ScoreCircle({ score }: { score: number }) {
  const borderColor =
    score >= 70
      ? 'border-emerald-500'
      : score >= 40
        ? 'border-amber-500'
        : 'border-red-500'

  const textColor =
    score >= 70
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'

  return (
    <div
      className={cn(
        'h-16 w-16 rounded-full border-4 flex flex-col items-center justify-center shrink-0',
        borderColor
      )}
    >
      <span className={cn('text-xl font-bold leading-none tabular-nums', textColor)}>
        {score}
      </span>
      <span className="text-[10px] text-muted-foreground leading-none mt-0.5">score</span>
    </div>
  )
}

export function LeadProfileCard({ lead }: LeadProfileCardProps) {
  const initials = `${lead.firstName[0]}${lead.lastName[0]}`

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar + main info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold leading-tight">
                  {lead.firstName} {lead.lastName}
                </h1>
                <Badge
                  variant="outline"
                  className={cn('capitalize text-xs font-medium', statusStyles[lead.status])}
                >
                  {statusLabels[lead.status]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {sourceLabels[lead.source] ?? lead.source}
                </Badge>
              </div>
              {(lead.position || lead.company) && (
                <p className="text-muted-foreground text-sm mb-3">
                  {lead.position}
                  {lead.position && lead.company ? ' at ' : ''}
                  {lead.companyId ? (
                    <Link to={ROUTES.COMPANY_DETAIL(lead.companyId)} className="hover:text-foreground hover:underline">
                      {lead.company}
                    </Link>
                  ) : lead.company}
                </p>
              )}
            </div>
          </div>

          {/* Score circle */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Lead Score
              </span>
              <ScoreCircle score={lead.score} />
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
          {lead.email && (
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              {/* Communication is disabled for initial release */}
              {/* <Link
                to={`/communication?leadId=${lead.id}&name=${encodeURIComponent(`${lead.firstName} ${lead.lastName}`)}&tab=email`}
                className="text-primary hover:underline truncate"
              >
                {lead.email}
              </Link> */}
              <span className="text-foreground truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2.5 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              {/* Communication is disabled for initial release */}
              {/* <Link
                to={`/communication?leadId=${lead.id}&name=${encodeURIComponent(`${lead.firstName} ${lead.lastName}`)}&tab=call`}
                className="hover:text-primary"
              >
                {lead.phone}
              </Link> */}
              <span className="text-foreground">{lead.phone}</span>
            </div>
          )}
          {lead.assignedTo && (
            <div className="flex items-center gap-2.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Assigned to <span className="font-medium">{lead.assignedTo}</span></span>
            </div>
          )}
          {lead.lastActivity && (
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Last activity: {lead.lastActivity}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Created: {lead.createdAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
