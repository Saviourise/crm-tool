import type { Campaign, EmailTemplate, AIGeneration, CampaignStatus, CampaignType, TemplateCategory } from './typings'

// ─── Status & type config ─────────────────────────────────────────────────────

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string; dot: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground/50',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20',
    dot: 'bg-primary',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-[oklch(var(--metric-purple))] text-[oklch(var(--secondary))] border-[oklch(var(--secondary))]/20',
    dot: 'bg-[oklch(var(--secondary))]',
  },
}

export const CAMPAIGN_TYPE_CONFIG: Record<CampaignType, { label: string }> = {
  email: { label: 'Email' },
  sms: { label: 'SMS' },
  social: { label: 'Social' },
  'multi-channel': { label: 'Multi-channel' },
}

export const TEMPLATE_CATEGORY_CONFIG: Record<TemplateCategory, { label: string; color: string }> = {
  welcome: { label: 'Welcome', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' },
  nurture: { label: 'Nurture', color: 'bg-[oklch(var(--metric-blue))] text-primary border-primary/20' },
  promotional: { label: 'Promotional', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800' },
  'follow-up': { label: 'Follow-up', color: 'bg-[oklch(var(--metric-orange))] text-[oklch(var(--warning))] border-[oklch(var(--warning))]/20' },
  newsletter: { label: 'Newsletter', color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800' },
  're-engagement': { label: 'Re-engagement', color: 'bg-[oklch(var(--metric-red))] text-destructive border-destructive/20' },
}

export const CAMPAIGN_STATUS_OPTIONS: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
]

export const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'social', label: 'Social' },
  { value: 'multi-channel', label: 'Multi-channel' },
]

// ─── Mock Campaigns ───────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Product Launch — Enterprise Tier',
    type: 'multi-channel',
    status: 'active',
    targetAudience: 'Enterprise prospects',
    startDate: 'Feb 1, 2026',
    endDate: 'Mar 31, 2026',
    metrics: { sent: 4200, opened: 1848, clicked: 462, converted: 58 },
    createdAt: 'Jan 20, 2026',
  },
  {
    id: '2',
    name: 'Re-engagement: Dormant Contacts',
    type: 'email',
    status: 'active',
    targetAudience: 'Contacts inactive 90+ days',
    startDate: 'Feb 10, 2026',
    endDate: 'Mar 10, 2026',
    metrics: { sent: 1850, opened: 518, clicked: 93, converted: 12 },
    createdAt: 'Feb 5, 2026',
  },
  {
    id: '3',
    name: 'Spring Promotion — SMB Segment',
    type: 'email',
    status: 'scheduled',
    targetAudience: 'SMB leads & contacts',
    startDate: 'Mar 1, 2026',
    endDate: 'Mar 31, 2026',
    metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    createdAt: 'Feb 18, 2026',
  },
  {
    id: '4',
    name: 'LinkedIn Thought Leadership Series',
    type: 'social',
    status: 'active',
    targetAudience: 'Decision makers — LinkedIn',
    startDate: 'Jan 15, 2026',
    endDate: 'Apr 15, 2026',
    metrics: { sent: 12, opened: 9400, clicked: 1128, converted: 84 },
    createdAt: 'Jan 10, 2026',
  },
  {
    id: '5',
    name: 'Webinar Invite: CRM Best Practices',
    type: 'email',
    status: 'completed',
    targetAudience: 'All qualified leads',
    startDate: 'Jan 20, 2026',
    endDate: 'Feb 5, 2026',
    metrics: { sent: 3100, opened: 1426, clicked: 527, converted: 142 },
    createdAt: 'Jan 12, 2026',
  },
  {
    id: '6',
    name: 'SMS Flash Sale — Feb Offer',
    type: 'sms',
    status: 'completed',
    targetAudience: 'Active customers with SMS opt-in',
    startDate: 'Feb 14, 2026',
    endDate: 'Feb 16, 2026',
    metrics: { sent: 920, opened: 804, clicked: 368, converted: 74 },
    createdAt: 'Feb 10, 2026',
  },
  {
    id: '7',
    name: 'Onboarding Drip Sequence',
    type: 'email',
    status: 'active',
    targetAudience: 'New customers (last 30 days)',
    startDate: 'Jan 1, 2026',
    metrics: { sent: 680, opened: 578, clicked: 289, converted: 0 },
    createdAt: 'Dec 28, 2025',
  },
  {
    id: '8',
    name: 'Year-End Review Newsletter',
    type: 'email',
    status: 'paused',
    targetAudience: 'All subscribers',
    startDate: 'Feb 20, 2026',
    metrics: { sent: 5200, opened: 1196, clicked: 208, converted: 0 },
    createdAt: 'Feb 15, 2026',
  },
  {
    id: '9',
    name: 'Product Update Announcement',
    type: 'multi-channel',
    status: 'draft',
    targetAudience: 'All active customers',
    metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    createdAt: 'Feb 22, 2026',
  },
]

// ─── Mock Email Templates ─────────────────────────────────────────────────────

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 't1',
    name: 'Welcome to the Platform',
    subject: 'Welcome, {{first_name}}! Here\'s how to get started',
    preview: 'Thank you for joining us. We\'re excited to help you grow your business. In this email, we\'ll walk you through the key features to get you up and running quickly.',
    category: 'welcome',
    usageCount: 248,
    createdAt: 'Jan 5, 2026',
  },
  {
    id: 't2',
    name: 'Lead Nurture — Value Proposition',
    subject: 'How {{company}} can save 10+ hours a week',
    preview: 'We\'ve helped hundreds of teams like yours automate their workflows and close more deals in less time. Here\'s what our customers are saying...',
    category: 'nurture',
    usageCount: 184,
    createdAt: 'Jan 12, 2026',
  },
  {
    id: 't3',
    name: 'Monthly Newsletter',
    subject: 'What\'s new in February',
    preview: 'This month we\'re covering the latest product updates, industry insights, and success stories from our community. Plus, an exclusive offer just for subscribers.',
    category: 'newsletter',
    usageCount: 96,
    createdAt: 'Jan 15, 2026',
  },
  {
    id: 't4',
    name: 'Follow-up After Demo',
    subject: 'Great meeting you, {{first_name}} — next steps',
    preview: 'Thank you for taking the time to see our platform in action. As discussed, I\'m attaching the proposal and a summary of the key features we covered.',
    category: 'follow-up',
    usageCount: 312,
    createdAt: 'Jan 8, 2026',
  },
  {
    id: 't5',
    name: 'Flash Sale Announcement',
    subject: '30% off — this weekend only',
    preview: 'Our biggest promotion of the quarter is here. Upgrade your plan before Sunday at midnight and lock in 30% savings for the full year. No promo code needed.',
    category: 'promotional',
    usageCount: 62,
    createdAt: 'Feb 1, 2026',
  },
  {
    id: 't6',
    name: 'We Miss You — Come Back',
    subject: '{{first_name}}, we saved something for you',
    preview: 'It\'s been a while since we\'ve heard from you. A lot has changed — we\'ve shipped 20+ new features since your last login. Here\'s a quick catch-up, plus a special offer to welcome you back.',
    category: 're-engagement',
    usageCount: 138,
    createdAt: 'Jan 20, 2026',
  },
]

// ─── Mock AI Generations ──────────────────────────────────────────────────────

export const MOCK_GENERATIONS: AIGeneration[] = [
  {
    id: 'g1',
    type: 'email',
    tone: 'professional',
    prompt: 'Write a follow-up email after a product demo for enterprise CRM software',
    output: `Subject: Following up on today's demo — next steps for {{company}}

Hi {{first_name}},

Thank you for taking the time to explore our platform with us today. It was great learning more about {{company}}'s goals and understanding how we can help your team close more deals, faster.

Based on our conversation, here are the three features that stood out most for your use case:

• **AI-powered lead scoring** — automatically prioritize your highest-value prospects
• **Pipeline automation** — reduce manual follow-up by 60% with smart workflows
• **Real-time analytics** — give your leadership team the visibility they need

I've attached a tailored proposal with pricing options that fit the team size we discussed. I'd love to schedule a 30-minute call this week to walk through it together and answer any questions.

Does Thursday or Friday work for you?

Best,
{{sender_name}}`,
    createdAt: 'Feb 22, 2026',
  },
  {
    id: 'g2',
    type: 'social',
    tone: 'engaging',
    prompt: 'LinkedIn post about CRM adoption improving sales team performance',
    output: `We just hit a milestone worth sharing.

After rolling out our CRM platform to 3 enterprise clients last quarter, the numbers are in:

- 42% faster lead response time
- 28% increase in pipeline conversion
- 15 hours/week saved per rep on admin tasks

The secret? It's not just the tool — it's the process behind it.

The teams that see the biggest gains are the ones who commit to:
→ Logging every interaction (yes, even the short calls)
→ Using lead scoring to focus effort where it counts
→ Reviewing pipeline data weekly as a team

CRM is only as powerful as the habits around it.

What's the one CRM habit that's made the biggest difference for your team? Drop it in the comments 👇

#SalesOps #CRM #B2BSales #SalesLeadership`,
    createdAt: 'Feb 21, 2026',
  },
]
