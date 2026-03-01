import { Globe, Users, DollarSign, User, Calendar, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getStatusClass, formatRevenue } from '../../utils'
import type { Company } from '../../typings'

interface CompanyProfileCardProps {
  company: Company
}

export function CompanyProfileCard({ company }: CompanyProfileCardProps) {
  const fields = [
    { icon: Globe, label: 'Website', value: company.website, href: `https://${company.website}` },
    { icon: Briefcase, label: 'Industry', value: company.industry },
    { icon: Users, label: 'Employees', value: company.employees.toLocaleString() },
    { icon: DollarSign, label: 'Annual Revenue', value: formatRevenue(company.annualRevenue) },
    { icon: User, label: 'Owner', value: company.owner },
    { icon: Calendar, label: 'Created', value: new Date(company.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{company.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{company.industry}</p>
          </div>
          <Badge
            variant="outline"
            className={cn('capitalize text-xs font-medium', getStatusClass(company.status))}
          >
            {company.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
