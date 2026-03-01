import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  User, Lock, Bell, Users, CreditCard, Plug, ShieldCheck,
  Sliders, Zap, GitBranch, Shield, ClipboardList,
} from 'lucide-react'
import { ProfileSection } from './components/ProfileSection'
import { PasswordSection } from './components/PasswordSection'
import { NotificationsSection } from './components/NotificationsSection'
import { TeamSection } from './components/TeamSection'
import { BillingSection } from './components/BillingSection'
import { IntegrationsSection } from './components/IntegrationsSection'
import { SecuritySection } from './components/SecuritySection'
import type { SettingsSection } from './typings'
import { cn } from '@/lib/utils'

// Lazy-load new sections (they'll be created by the build agent)
import { CustomFieldsSection } from './components/CustomFieldsSection'
import { AutomationSection } from './components/AutomationSection'
import { LeadRoutingSection } from './components/LeadRoutingSection'
import { AuditLogSection } from './components/AuditLogSection'
import { PrivacySection } from './components/PrivacySection'

// ─── Nav config ────────────────────────────────────────────────────────────────

const NAV_GROUPS: { label: string; items: { id: SettingsSection; label: string; icon: React.ElementType }[] }[] = [
  {
    label: 'Account',
    items: [
      { id: 'profile',       label: 'Profile',       icon: User },
      { id: 'password',      label: 'Password',      icon: Lock },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'team',          label: 'Team',          icon: Users },
      { id: 'billing',       label: 'Billing',       icon: CreditCard },
      { id: 'custom-fields', label: 'Custom Fields', icon: Sliders },
      { id: 'automation',    label: 'Automation',    icon: Zap },
      { id: 'lead-routing',  label: 'Lead Routing',  icon: GitBranch },
      { id: 'privacy',       label: 'Privacy',       icon: Shield },
    ],
  },
  {
    label: 'Connections',
    items: [
      { id: 'integrations', label: 'Integrations', icon: Plug },
      { id: 'security',     label: 'Security',     icon: ShieldCheck },
      { id: 'audit-log',    label: 'Audit Log',    icon: ClipboardList },
    ],
  },
]

const SECTION_TITLES: Record<SettingsSection, { title: string; description: string }> = {
  profile:        { title: 'Profile',              description: 'Manage your personal information and preferences.' },
  password:       { title: 'Password',             description: 'Keep your account secure with a strong password.' },
  notifications:  { title: 'Notifications',        description: 'Control when and how you receive alerts.' },
  team:           { title: 'Team',                 description: 'Configure your workspace and organization details.' },
  billing:        { title: 'Billing & Plans',      description: 'Manage your subscription plan, AI add-ons, payment, and invoices.' },
  'custom-fields':{ title: 'Custom Fields',        description: 'Add custom data fields to your CRM entities.' },
  automation:     { title: 'Workflow Automation',  description: 'Automate repetitive tasks with trigger-based rules.' },
  'lead-routing': { title: 'Lead Routing',         description: 'Configure how incoming leads are assigned to your team.' },
  privacy:        { title: 'Privacy & Compliance', description: 'Manage data retention, consent, and compliance settings.' },
  integrations:   { title: 'Integrations',         description: 'Connect external tools and services.' },
  security:       { title: 'Security',             description: 'Protect your account with 2FA, sessions, and API keys.' },
  'audit-log':    { title: 'Audit Log',            description: 'Track all user actions and system events.' },
}

const ALL_SECTIONS = Object.keys(SECTION_TITLES) as SettingsSection[]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sectionParam = searchParams.get('section') as SettingsSection | null

  const initialSection: SettingsSection =
    sectionParam && ALL_SECTIONS.includes(sectionParam) ? sectionParam : 'profile'

  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection)

  // Sync if URL changes externally
  useEffect(() => {
    if (sectionParam && ALL_SECTIONS.includes(sectionParam)) {
      setActiveSection(sectionParam)
    }
  }, [sectionParam])

  function handleNavClick(id: SettingsSection) {
    setActiveSection(id)
    setSearchParams({ section: id }, { replace: true })
  }

  const { title, description } = SECTION_TITLES[activeSection]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, workspace, and integrations.
        </p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar nav */}
        <nav className="w-48 shrink-0 space-y-5 sticky top-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>

          {activeSection === 'profile'        && <ProfileSection />}
          {activeSection === 'password'       && <PasswordSection />}
          {activeSection === 'notifications'  && <NotificationsSection />}
          {activeSection === 'team'           && <TeamSection />}
          {activeSection === 'billing'        && <BillingSection />}
          {activeSection === 'custom-fields'  && <CustomFieldsSection />}
          {activeSection === 'automation'     && <AutomationSection />}
          {activeSection === 'lead-routing'   && <LeadRoutingSection />}
          {activeSection === 'privacy'        && <PrivacySection />}
          {activeSection === 'integrations'   && <IntegrationsSection />}
          {activeSection === 'security'       && <SecuritySection />}
          {activeSection === 'audit-log'      && <AuditLogSection />}
        </div>
      </div>
    </div>
  )
}
