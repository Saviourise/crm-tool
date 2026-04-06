import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User, Lock, Bell, Users, CreditCard, Plug, ShieldCheck,
  Sliders, Zap, GitBranch, Shield, ClipboardList,
} from 'lucide-react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileSection } from './components/ProfileSection'
import { PasswordSection } from './components/PasswordSection'
import { NotificationsSection } from './components/NotificationsSection'
import { TeamSection } from './components/TeamSection'
import { BillingSection } from './components/BillingSection'
import { IntegrationsSection } from './components/IntegrationsSection'
import { SecuritySection } from './components/SecuritySection'
import type { SettingsSection } from './typings'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/context'
import type { Permission, Feature } from '@/auth/types'
import { AccessDenied } from '@/auth/guards'

import { CustomFieldsSection } from './components/CustomFieldsSection'
import { AutomationSection } from './components/AutomationSection'
import { LeadRoutingSection } from './components/LeadRoutingSection'
import { AuditLogSection } from './components/AuditLogSection'
import { PrivacySection } from './components/PrivacySection'

// ─── Nav config ────────────────────────────────────────────────────────────────

interface SettingsNavItem {
  id: SettingsSection
  label: string
  icon: React.ElementType
  permission?: Permission
  planRequired?: Feature
}

const NAV_GROUPS: { label: string; items: SettingsNavItem[] }[] = [
  {
    label: 'Account',
    items: [
      { id: 'profile',       label: 'Profile',       icon: User,          permission: 'settings.profile' },
      { id: 'password',      label: 'Password',      icon: Lock,          permission: 'settings.profile' },
      { id: 'notifications', label: 'Notifications', icon: Bell,          permission: 'settings.profile' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'team',          label: 'Team',          icon: Users,         permission: 'settings.team' },
      { id: 'billing',       label: 'Billing',       icon: CreditCard,    permission: 'settings.billing' },
      { id: 'custom-fields', label: 'Custom Fields', icon: Sliders,       permission: 'settings.custom-fields', planRequired: 'custom-fields' },
      { id: 'automation',    label: 'Automation',    icon: Zap,           permission: 'settings.automation',    planRequired: 'automation' },
      { id: 'lead-routing',  label: 'Lead Routing',  icon: GitBranch,     permission: 'settings.lead-routing',  planRequired: 'lead-routing' },
      { id: 'privacy',       label: 'Privacy',       icon: Shield,        permission: 'settings.privacy',       planRequired: 'privacy' },
    ],
  },
  {
    label: 'Connections',
    items: [
      { id: 'integrations',  label: 'Integrations',  icon: Plug,          permission: 'settings.integrations' },
      { id: 'security',      label: 'Security',      icon: ShieldCheck,   permission: 'settings.security' },
      { id: 'audit-log',     label: 'Audit Log',     icon: ClipboardList, permission: 'settings.audit-log',     planRequired: 'audit-log' },
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

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const { can, hasPlan } = useAuth()
  const { section } = useParams<{ section?: string }>()
  const navigate = useNavigate()

  function isAccessible(item: SettingsNavItem): boolean {
    if (item.planRequired && !hasPlan(item.planRequired)) return false
    if (item.permission && !can(item.permission)) return false
    return true
  }

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(isAccessible),
  })).filter((group) => group.items.length > 0)

  const allVisibleSections = visibleGroups.flatMap((g) => g.items.map((i) => i.id))

  const sectionParam = section as SettingsSection | undefined

  // Resolve the active section — fall back to first accessible if requested section is blocked
  function resolveSection(param: SettingsSection | undefined): SettingsSection {
    if (param && allVisibleSections.includes(param)) return param
    return allVisibleSections[0] ?? 'profile'
  }

  const [activeSection, setActiveSection] = useState<SettingsSection>(() =>
    resolveSection(sectionParam)
  )

  useEffect(() => {
    const resolved = resolveSection(sectionParam)
    setActiveSection(resolved)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionParam])

  function handleNavClick(id: SettingsSection) {
    navigate(`/settings/${id}`, { replace: true })
  }

  const { title, description } = SECTION_TITLES[activeSection] ?? SECTION_TITLES['profile']

  // Check if the currently active section is actually accessible
  const activeIsAccessible = allVisibleSections.includes(activeSection)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account, workspace, and integrations.
        </p>
      </div>

      {/* Mobile nav — select dropdown */}
      <div className="md:hidden">
        <Select value={activeSection} onValueChange={(v) => handleNavClick(v as SettingsSection)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visibleGroups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Sidebar nav — desktop only */}
        <nav className="hidden md:block w-48 shrink-0 space-y-5 sticky top-6">
          {visibleGroups.map((group) => (
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
          {!activeIsAccessible ? (
            <AccessDenied />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
