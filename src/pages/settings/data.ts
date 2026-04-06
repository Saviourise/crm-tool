import type {
  ProfileData, TeamData, NotificationPrefs, Plan, Invoice,
  PaymentMethod, Integration, Session, ApiKey,
  CustomField, AutomationRule, LeadRoutingConfig, AuditEntry, PrivacySettings,
} from './typings'

export const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)' },
  { value: 'America/Chicago',     label: 'Central Time (CT)' },
  { value: 'America/Denver',      label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London',       label: 'London (GMT)' },
  { value: 'Europe/Paris',        label: 'Central European (CET)' },
  { value: 'Asia/Tokyo',          label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney',    label: 'Sydney (AEDT)' },
]

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
]

export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
]

export const AVATAR_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
  { value: '#ec4899', label: 'Pink' },
]

export const PROFILE: ProfileData = {
  name:        'Alex Rivera',
  email:       'alex@company.com',
  phone:       '+1 (555) 012-3456',
  jobTitle:    'Sales Director',
  timezone:    'America/New_York',
  language:    'en',
  avatarColor: 'bg-blue-500',
  initials:    'AR',
}

export const TEAM: TeamData = {
  orgName:     'Acme Corporation',
  website:     'https://acme.com',
  defaultRole: 'sales-rep',
  timezone:    'America/New_York',
  dateFormat:  'MM/DD/YYYY',
}

export const NOTIFICATION_PREFS: NotificationPrefs = {
  newLead:          { email: true,  inApp: true  },
  dealStage:        { email: true,  inApp: true  },
  taskDue:          { email: true,  inApp: true  },
  taskOverdue:      { email: true,  inApp: true  },
  mention:          { email: false, inApp: true  },
  campaignLaunched: { email: true,  inApp: false },
  reportReady:      { email: true,  inApp: false },
  newContact:       { email: false, inApp: true  },
}

export const NOTIFICATION_EVENTS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'newLead',          label: 'New Lead Assigned',       description: 'When a lead is assigned to you' },
  { key: 'dealStage',        label: 'Deal Stage Changed',      description: 'When one of your deals moves to a new stage' },
  { key: 'taskDue',          label: 'Task Due Soon',           description: '24 hours before a task deadline' },
  { key: 'taskOverdue',      label: 'Task Overdue',            description: 'When a task passes its due date without completion' },
  { key: 'mention',          label: 'Mentioned in a Note',     description: 'When someone @mentions you in a note or comment' },
  { key: 'campaignLaunched', label: 'Campaign Published',      description: 'When a marketing campaign goes live' },
  { key: 'reportReady',      label: 'Report Ready',            description: 'When a scheduled report has been generated' },
  { key: 'newContact',       label: 'New Contact Added',       description: 'When a contact is created in your pipeline' },
]

export const PLANS: Plan[] = [
  {
    id:           'free',
    name:         'Free',
    description:  'Perfect for individuals getting started with CRM.',
    monthlyPrice: 0,
    yearlyPrice:  0,
    users:        '1 user',
    contacts:     '250',
    emails:       '500 / mo',
    features:     [
      'Contact management',
      'Basic task tracking',
      'Email logging',
      '1 pipeline',
      '2 GB storage',
    ],
    aiFeatures:   [],
    isCurrent:    false,
  },
  {
    id:           'basic',
    name:         'Basic',
    description:  'For small teams ready to grow their pipeline.',
    monthlyPrice: 19,
    yearlyPrice:  15,
    users:        'Up to 5',
    contacts:     '2,500',
    emails:       '10,000 / mo',
    features:     [
      'Everything in Free',
      'Lead management',
      'Pipeline & Kanban board',
      'Calendar & scheduling',
      'Companies management',
      'Basic reporting',
      '10 GB storage',
      'Email support',
    ],
    aiFeatures:   [],
    isCurrent:    false,
  },
  {
    id:           'professional',
    name:         'Professional',
    description:  'For growing teams that need automation and insights.',
    monthlyPrice: 49,
    yearlyPrice:  39,
    users:        'Up to 15',
    contacts:     '10,000',
    emails:       '50,000 / mo',
    features:     [
      'Everything in Basic',
      'Multi-pipeline support',
      'Marketing campaigns',
      'CSV import / export',
      'Analytics & reports',
      'Custom fields',
      'API access',
      '50 GB storage',
      'Priority support',
    ],
    aiFeatures:   [
      'AI content generator (Marketing)',
      'AI lead scoring',
      'AI sentiment analysis',
    ],
    highlighted:  true,
    isCurrent:    true,
  },
  {
    id:           'premium',
    name:         'Premium',
    description:  'For teams that want full AI-powered selling.',
    monthlyPrice: 99,
    yearlyPrice:  79,
    users:        'Up to 50',
    contacts:     '50,000',
    emails:       '200,000 / mo',
    features:     [
      'Everything in Professional',
      'Workflow automation',
      'Lead routing rules',
      'Audit log',
      'SSO / SAML',
      'Custom integrations',
      '200 GB storage',
      'Dedicated account manager',
    ],
    aiFeatures:   [
      'AI content generator',
      'AI social scheduler',
      'AI voice agents',
      'AI chat agent (website widget)',
      'AI next-best-action suggestions',
      'AI deal risk alerts',
    ],
    isCurrent:    false,
  },
  {
    id:           'enterprise',
    name:         'Enterprise',
    description:  'Unlimited scale, full control, and white-glove support.',
    monthlyPrice: 199,
    yearlyPrice:  159,
    users:        'Unlimited',
    contacts:     'Unlimited',
    emails:       'Unlimited',
    features:     [
      'Everything in Premium',
      'Unlimited pipelines',
      'Privacy & GDPR tools',
      'SLA guarantee (99.9% uptime)',
      'Custom storage',
      'On-premise deployment option',
      'White-label option',
      '24/7 phone support',
    ],
    aiFeatures:   [
      'All Premium AI features',
      'AI video generator',
      'Custom AI agent training',
      'AI-powered forecasting',
      'Dedicated AI model fine-tuning',
    ],
    isCurrent:    false,
  },
]

export const INVOICES: Invoice[] = [
  { id: 'inv-006', date: 'Feb 1, 2026', amount: 49, status: 'paid', description: 'Pro Plan — February 2026' },
  { id: 'inv-005', date: 'Jan 1, 2026', amount: 49, status: 'paid', description: 'Pro Plan — January 2026' },
  { id: 'inv-004', date: 'Dec 1, 2025', amount: 49, status: 'paid', description: 'Pro Plan — December 2025' },
  { id: 'inv-003', date: 'Nov 1, 2025', amount: 49, status: 'paid', description: 'Pro Plan — November 2025' },
  { id: 'inv-002', date: 'Oct 1, 2025', amount: 49, status: 'paid', description: 'Pro Plan — October 2025' },
  { id: 'inv-001', date: 'Sep 1, 2025', amount: 49, status: 'paid', description: 'Pro Plan — September 2025' },
]

export const PAYMENT_METHOD: PaymentMethod = {
  brand:    'Visa',
  last4:    '4242',
  expMonth: 12,
  expYear:  2027,
}

export const USAGE = {
  users:    { used: 8,     limit: 15 },
  contacts: { used: 3820,  limit: 10000 },
  emails:   { used: 12400, limit: 50000 },
  storage:  { used: 12.4,  limit: 50 },
}

export const INTEGRATIONS: Integration[] = [
  { id: 'gmail',     name: 'Gmail',              description: 'Sync emails and contacts from Google Workspace.',          category: 'Email',      status: 'connected',    iconName: 'Mail',          connectedAccount: 'alex@company.com' },
  { id: 'outlook',   name: 'Outlook',            description: 'Connect Microsoft 365 mailbox and calendar.',              category: 'Email',      status: 'disconnected', iconName: 'Globe' },
  { id: 'slack',     name: 'Slack',              description: 'Get CRM notifications and alerts in Slack channels.',      category: 'Messaging',  status: 'connected',    iconName: 'MessageSquare', connectedAccount: 'acme-corp.slack.com' },
  { id: 'gcal',      name: 'Google Calendar',    description: 'Sync meetings and follow-ups with Google Calendar.',       category: 'Calendar',   status: 'disconnected', iconName: 'CalendarDays' },
  { id: 'zapier',    name: 'Zapier',             description: 'Automate workflows between 5,000+ apps.',                  category: 'Automation', status: 'connected',    iconName: 'Zap',           connectedAccount: '3 active zaps' },
  { id: 'twilio',    name: 'Twilio',             description: 'Send SMS and make calls directly from the CRM.',           category: 'Telephony',  status: 'disconnected', iconName: 'Phone' },
  { id: 'stripe',    name: 'Stripe',             description: 'Track payment events and deals linked to invoices.',        category: 'Payments',   status: 'disconnected', iconName: 'CreditCard' },
  { id: 'hubspot',   name: 'HubSpot',            description: 'Two-way sync contacts and deals with HubSpot CRM.',        category: 'CRM Sync',   status: 'disconnected', iconName: 'Building2' },
  { id: 'ms365',     name: 'Microsoft 365',      description: 'Connect your Microsoft 365 suite for email and calendar.', category: 'Email',      status: 'disconnected', iconName: 'Globe' },
  { id: 'whatsapp',  name: 'WhatsApp Business',  description: 'Send and receive WhatsApp messages from the CRM.',         category: 'Messaging',  status: 'disconnected', iconName: 'MessageCircle' },
]

export const SESSIONS: Session[] = [
  { id: 's1', device: 'desktop', browser: 'Chrome 121',    location: 'New York, US',  ip: '192.168.1.1', lastActive: 'Now',         isCurrent: true  },
  { id: 's2', device: 'mobile',  browser: 'Safari iOS 17', location: 'New York, US',  ip: '192.168.1.2', lastActive: '2 hours ago', isCurrent: false },
  { id: 's3', device: 'desktop', browser: 'Firefox 122',   location: 'Chicago, US',   ip: '10.0.0.15',   lastActive: 'Yesterday',   isCurrent: false },
]

export const API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production App',    prefix: 'crm_live_xK9m', created: 'Jan 15, 2026', lastUsed: '2 min ago',  scopes: ['contacts:read', 'leads:write', 'reports:read'] },
  { id: 'k2', name: 'Analytics Script',  prefix: 'crm_live_pR3n', created: 'Dec 3, 2025',  lastUsed: '1 day ago',  scopes: ['reports:read'] },
  { id: 'k3', name: 'Zapier Webhook',    prefix: 'crm_live_qT7w', created: 'Oct 20, 2025', lastUsed: '5 min ago',  scopes: ['contacts:read', 'leads:read'] },
]

// ─── Custom Fields ─────────────────────────────────────────────────────────────

export const MOCK_CUSTOM_FIELDS: CustomField[] = [
  { id: 'cf1',  label: 'LinkedIn URL',        type: 'text',    entity: 'contacts', required: false },
  { id: 'cf2',  label: 'Birthday',            type: 'date',    entity: 'contacts', required: false },
  { id: 'cf3',  label: 'Lead Source Detail',  type: 'select',  entity: 'contacts', required: false, options: ['Referral', 'Cold Call', 'Website', 'Event'] },
  { id: 'cf4',  label: 'Newsletter Opt-in',   type: 'boolean', entity: 'contacts', required: false },
  { id: 'cf5',  label: 'Budget Range',        type: 'select',  entity: 'leads',    required: true,  options: ['< $10k', '$10k-$50k', '$50k-$100k', '> $100k'] },
  { id: 'cf6',  label: 'Decision Date',       type: 'date',    entity: 'leads',    required: false },
  { id: 'cf7',  label: 'Score Override',      type: 'number',  entity: 'leads',    required: false },
  { id: 'cf8',  label: 'Contract Value',      type: 'number',  entity: 'deals',    required: true  },
  { id: 'cf9',  label: 'Renewal Date',        type: 'date',    entity: 'deals',    required: false },
  { id: 'cf10', label: 'Deal Type',           type: 'select',  entity: 'deals',    required: false, options: ['New Business', 'Upsell', 'Renewal', 'Expansion'] },
  { id: 'cf11', label: 'Estimated Hours',     type: 'number',  entity: 'tasks',    required: false },
  { id: 'cf12', label: 'External Ticket ID',  type: 'text',    entity: 'tasks',    required: false },
]

// ─── Automation Rules ──────────────────────────────────────────────────────────

export const MOCK_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'ar1',
    name: 'New Lead Welcome Email',
    trigger: 'lead-created',
    conditions: [{ field: 'source', operator: 'equals', value: 'Website' }],
    actions: [{ type: 'send-email' }, { type: 'create-task' }],
    enabled: true,
    executionsThisMonth: 142,
    successRate: 98,
  },
  {
    id: 'ar2',
    name: 'Deal Won Notification',
    trigger: 'deal-stage-changed',
    conditions: [],
    actions: [{ type: 'send-notification' }, { type: 'add-tag' }],
    enabled: true,
    executionsThisMonth: 37,
    successRate: 100,
  },
  {
    id: 'ar3',
    name: 'Overdue Task Escalation',
    trigger: 'task-overdue',
    conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
    actions: [{ type: 'assign-user' }],
    enabled: false,
    executionsThisMonth: 0,
    successRate: 94,
  },
  {
    id: 'ar4',
    name: 'Tag-based Lead Assignment',
    trigger: 'contact-tag-added',
    conditions: [],
    actions: [{ type: 'assign-user' }, { type: 'create-task' }, { type: 'send-email' }],
    enabled: true,
    executionsThisMonth: 58,
    successRate: 96,
  },
]

// ─── Lead Routing ──────────────────────────────────────────────────────────────

export const DEFAULT_LEAD_ROUTING: LeadRoutingConfig = {
  method: 'round-robin',
  members: [
    { id: 'm1', name: 'Sarah Chen',    active: true  },
    { id: 'm2', name: 'James Torres',  active: true  },
    { id: 'm3', name: 'Priya Nair',    active: true  },
    { id: 'm4', name: 'Marcus Webb',   active: false },
  ],
  territoryRules: [
    { id: 'tr1', field: 'country',  operator: 'equals',     value: 'USA',     assignedTo: 'Sarah Chen'   },
    { id: 'tr2', field: 'country',  operator: 'equals',     value: 'Canada',  assignedTo: 'James Torres' },
    { id: 'tr3', field: 'domain',   operator: 'ends with',  value: '.co.uk',  assignedTo: 'Priya Nair'   },
  ],
  scoreTiers: [
    { id: 'st1', minScore: 80, assignTo: 'Sarah Chen'   },
    { id: 'st2', minScore: 50, assignTo: 'James Torres' },
    { id: 'st3', minScore: 0,  assignTo: 'Marcus Webb'  },
  ],
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  { id: 'al1',  timestamp: '2026-03-01 09:14:22', user: 'Alex Rivera',   userInitials: 'AR', action: 'login',           entityType: 'Auth',    entityName: 'Session',          ip: '192.168.1.1', details: 'Successful login from Chrome on Windows 11' },
  { id: 'al2',  timestamp: '2026-03-01 09:22:05', user: 'Alex Rivera',   userInitials: 'AR', action: 'updated',         entityType: 'Contact', entityName: 'John Adeyemi',     ip: '192.168.1.1', details: 'Updated email address and phone number' },
  { id: 'al3',  timestamp: '2026-03-01 10:05:33', user: 'Sarah Chen',    userInitials: 'SC', action: 'created',         entityType: 'Lead',    entityName: 'Acme Corp — Q2',   ip: '10.0.0.22',   details: 'Lead created via web form submission' },
  { id: 'al4',  timestamp: '2026-03-01 10:18:47', user: 'James Torres',  userInitials: 'JT', action: 'deleted',         entityType: 'Task',    entityName: 'Follow up call',   ip: '10.0.0.45',   details: 'Task deleted — marked as duplicate' },
  { id: 'al5',  timestamp: '2026-03-01 10:44:11', user: 'Alex Rivera',   userInitials: 'AR', action: 'export',          entityType: 'Contact', entityName: 'All Contacts',     ip: '192.168.1.1', details: 'Exported 3,820 contacts to CSV' },
  { id: 'al6',  timestamp: '2026-03-01 11:02:58', user: 'Priya Nair',    userInitials: 'PN', action: 'created',         entityType: 'Deal',    entityName: 'Enterprise Plan',  ip: '10.0.0.77',   details: 'New deal created in Proposal stage, value $48,000' },
  { id: 'al7',  timestamp: '2026-03-01 11:30:14', user: 'Alex Rivera',   userInitials: 'AR', action: 'settings-change', entityType: 'Settings', entityName: 'Billing',         ip: '192.168.1.1', details: 'Updated billing plan from Basic to Professional' },
  { id: 'al8',  timestamp: '2026-03-01 12:00:00', user: 'Marcus Webb',   userInitials: 'MW', action: 'login',           entityType: 'Auth',    entityName: 'Session',          ip: '172.16.0.3',  details: 'Successful login from Firefox on macOS' },
  { id: 'al9',  timestamp: '2026-03-01 12:15:22', user: 'Sarah Chen',    userInitials: 'SC', action: 'updated',         entityType: 'Lead',    entityName: 'TechStart Ltd',    ip: '10.0.0.22',   details: 'Lead status changed from New to Qualified' },
  { id: 'al10', timestamp: '2026-03-01 13:04:09', user: 'James Torres',  userInitials: 'JT', action: 'created',         entityType: 'Contact', entityName: 'Lisa Nguyen',      ip: '10.0.0.45',   details: 'Contact added manually with full profile' },
  { id: 'al11', timestamp: '2026-03-01 13:45:33', user: 'Priya Nair',    userInitials: 'PN', action: 'export',          entityType: 'Report',  entityName: 'Q1 Sales Report',  ip: '10.0.0.77',   details: 'Exported sales performance report as PDF' },
  { id: 'al12', timestamp: '2026-03-01 14:10:02', user: 'Alex Rivera',   userInitials: 'AR', action: 'deleted',         entityType: 'Lead',    entityName: 'Old Campaign Lead', ip: '192.168.1.1', details: 'Lead deleted — unqualified after 90 days' },
  { id: 'al13', timestamp: '2026-03-01 14:55:18', user: 'Marcus Webb',   userInitials: 'MW', action: 'updated',         entityType: 'Deal',    entityName: 'Renewal 2026',     ip: '172.16.0.3',  details: 'Deal stage moved from Negotiation to Closed Won' },
  { id: 'al14', timestamp: '2026-03-01 15:20:44', user: 'Sarah Chen',    userInitials: 'SC', action: 'settings-change', entityType: 'Settings', entityName: 'Automation',      ip: '10.0.0.22',   details: 'Enabled automation rule: New Lead Welcome Email' },
  { id: 'al15', timestamp: '2026-03-01 15:50:30', user: 'Alex Rivera',   userInitials: 'AR', action: 'created',         entityType: 'Task',    entityName: 'Demo prep — Acme', ip: '192.168.1.1', details: 'Task created and assigned to James Torres' },
  { id: 'al16', timestamp: '2026-03-01 16:08:11', user: 'James Torres',  userInitials: 'JT', action: 'login',           entityType: 'Auth',    entityName: 'Session',          ip: '10.0.0.45',   details: 'Successful login from Safari on iPhone' },
  { id: 'al17', timestamp: '2026-03-01 16:33:59', user: 'Priya Nair',    userInitials: 'PN', action: 'updated',         entityType: 'Contact', entityName: 'David Kim',        ip: '10.0.0.77',   details: 'Updated contact tags and lifecycle stage' },
  { id: 'al18', timestamp: '2026-03-01 17:01:22', user: 'Alex Rivera',   userInitials: 'AR', action: 'settings-change', entityType: 'Settings', entityName: 'Integrations',    ip: '192.168.1.1', details: 'Connected Zapier integration, 3 zaps configured' },
  { id: 'al19', timestamp: '2026-02-28 17:44:05', user: 'Marcus Webb',   userInitials: 'MW', action: 'deleted',         entityType: 'Contact', entityName: 'Test Contact',     ip: '172.16.0.3',  details: 'Contact deleted — created during testing' },
  { id: 'al20', timestamp: '2026-02-28 18:00:00', user: 'Sarah Chen',    userInitials: 'SC', action: 'export',          entityType: 'Lead',    entityName: 'All Leads',        ip: '10.0.0.22',   details: 'Exported 892 leads to CSV for campaign' },
  { id: 'al21', timestamp: '2026-02-28 09:12:34', user: 'Alex Rivera',   userInitials: 'AR', action: 'login',           entityType: 'Auth',    entityName: 'Session',          ip: '192.168.1.1', details: 'Successful login from Chrome on Windows 11' },
  { id: 'al22', timestamp: '2026-02-27 14:22:11', user: 'Priya Nair',    userInitials: 'PN', action: 'created',         entityType: 'Contact', entityName: 'Nguyen & Partners', ip: '10.0.0.77',  details: 'Company contact created from LinkedIn import' },
]

// ─── Privacy Settings ──────────────────────────────────────────────────────────

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataRetention: {
    contacts: '5yr',
    leads:    '2yr',
    deals:    '5yr',
  },
  cookieConsent: {
    analytics: true,
    marketing: false,
  },
  erasureRequests: [
    { id: 'er1', email: 'jsmith@example.com',  dateSubmitted: '2026-02-10', status: 'completed'  },
    { id: 'er2', email: 'maria.l@sample.org',  dateSubmitted: '2026-02-22', status: 'processing' },
    { id: 'er3', email: 'unknown99@temp.net',  dateSubmitted: '2026-02-28', status: 'pending'    },
  ],
}
