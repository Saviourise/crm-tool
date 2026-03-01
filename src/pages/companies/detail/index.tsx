import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/router/routes'
import { MOCK_COMPANIES } from '../data'
import { CompanyProfileCard } from './components/CompanyProfileCard'
import { CompanyContacts } from './components/CompanyContacts'
import { CompanyDeals } from './components/CompanyDeals'

type Tab = 'overview' | 'contacts' | 'deals'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'deals', label: 'Deals' },
]

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const company = MOCK_COMPANIES.find((c) => c.id === id)

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg font-medium">Company not found</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.COMPANIES}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link to={ROUTES.COMPANIES}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <a
            href={`https://${company.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5 inline-block"
          >
            {company.website}
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <CompanyProfileCard company={company} />}
      {activeTab === 'contacts' && <CompanyContacts companyName={company.name} />}
      {activeTab === 'deals' && <CompanyDeals companyName={company.name} />}
    </div>
  )
}
