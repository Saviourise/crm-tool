import type { HelpArticle, HelpCategory } from './typings'

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'getting-started', name: 'Getting Started', description: 'Learn the basics of the CRM', icon: 'BookOpen', articleCount: 5 },
  { id: 'contacts', name: 'Contacts & Companies', description: 'Manage your contacts and companies', icon: 'Users', articleCount: 5 },
  { id: 'pipeline', name: 'Pipeline & Deals', description: 'Track and close your deals', icon: 'TrendingUp', articleCount: 5 },
  { id: 'campaigns', name: 'Campaigns & Marketing', description: 'Run targeted campaigns', icon: 'Mail', articleCount: 5 },
  { id: 'reporting', name: 'Reporting & Analytics', description: 'Analyze your CRM data', icon: 'BarChart3', articleCount: 5 },
  { id: 'integrations', name: 'Integrations & API', description: 'Connect external tools', icon: 'Plug', articleCount: 5 },
]

export const HELP_ARTICLES: HelpArticle[] = [
  // Getting Started (5)
  { id: 'gs-1', categoryId: 'getting-started', title: 'How to set up your workspace', content: 'To get started, navigate to Settings > Team and enter your organization details. Then invite your team members using the Invite button...' },
  { id: 'gs-2', categoryId: 'getting-started', title: 'Importing your first contacts', content: 'Go to the Contacts page and click the Import button. Upload a CSV file with columns for First Name, Last Name, Email, and Company...' },
  { id: 'gs-3', categoryId: 'getting-started', title: 'Understanding the dashboard', content: 'The dashboard shows your key metrics at a glance: total contacts, active leads, pipeline value, and recent activity...' },
  { id: 'gs-4', categoryId: 'getting-started', title: 'Setting up your pipeline stages', content: 'Navigate to Pipeline and click the Board Config button to customize your deal stages, colors, and visible fields...' },
  { id: 'gs-5', categoryId: 'getting-started', title: 'Inviting your team', content: 'Go to Users > Invite User. Enter the email address and select a role. The invite email will include a registration link...' },
  // Contacts (5)
  { id: 'co-1', categoryId: 'contacts', title: 'Adding a new contact manually', content: 'Click Add Contact in the top right of the Contacts page. Fill in the required fields and click Save...' },
  { id: 'co-2', categoryId: 'contacts', title: 'Importing contacts from CSV', content: 'Prepare a CSV with headers matching CRM fields. Use the Import button and map each column to the correct field...' },
  { id: 'co-3', categoryId: 'contacts', title: 'Tagging and segmenting contacts', content: 'Tags allow you to group contacts for campaigns and filtering. Add tags in the contact detail page under the Tags section...' },
  { id: 'co-4', categoryId: 'contacts', title: 'Linking contacts to companies', content: 'When editing a contact, set the Company field. This automatically links the contact to the matching company record...' },
  { id: 'co-5', categoryId: 'contacts', title: 'Contact activity timeline', content: 'Open a contact detail page and switch to the Activity tab to see all emails, calls, notes, and tasks associated with that contact...' },
  // Pipeline (5)
  { id: 'pi-1', categoryId: 'pipeline', title: 'Creating a new deal', content: 'Click Add Deal on the Pipeline page. Fill in the deal name, company, value, expected close date, and stage...' },
  { id: 'pi-2', categoryId: 'pipeline', title: 'Moving deals between stages', content: 'On the Kanban board, drag a deal card to move it to a new stage. Alternatively, open the deal and change the stage in the detail view...' },
  { id: 'pi-3', categoryId: 'pipeline', title: 'Understanding probability', content: 'Each stage has a default win probability. You can override this per deal in the deal detail view under Probability...' },
  { id: 'pi-4', categoryId: 'pipeline', title: 'Using multiple pipelines', content: 'Create separate pipelines for different business units using the pipeline selector at the top of the Pipeline page...' },
  { id: 'pi-5', categoryId: 'pipeline', title: 'Pipeline filters and saved views', content: 'Use the Filters bar to narrow deals by assignee, value range, close date, or probability. Save your filter combination as a named view...' },
  // Campaigns (5)
  { id: 'ca-1', categoryId: 'campaigns', title: 'Creating an email campaign', content: 'Navigate to Marketing > Campaigns and click New Campaign. Choose a template, set your audience, and schedule or send immediately...' },
  { id: 'ca-2', categoryId: 'campaigns', title: 'Using campaign templates', content: 'Go to Marketing > Templates to browse pre-built templates. Click Use Template to start a campaign with that design...' },
  { id: 'ca-3', categoryId: 'campaigns', title: 'Tracking campaign performance', content: 'Campaign stats (opens, clicks, replies) appear on each campaign card. Click into a campaign for detailed analytics...' },
  { id: 'ca-4', categoryId: 'campaigns', title: 'AI content generation (Professional+)', content: 'On Professional plan and above, use the AI Hub tab in Marketing to generate email copy, subject lines, and social posts with AI...' },
  { id: 'ca-5', categoryId: 'campaigns', title: 'Scheduling campaigns', content: 'When creating a campaign, select Schedule instead of Send Now. Choose a date and time. The campaign will go out automatically...' },
  // Reporting (5)
  { id: 're-1', categoryId: 'reporting', title: 'Sales performance report', content: 'The Sales Performance tab shows monthly revenue, win rates, and top-performing team members with interactive charts...' },
  { id: 're-2', categoryId: 'reporting', title: 'Lead analytics report', content: 'The Lead Analytics tab breaks down leads by source, status, and conversion rate over time...' },
  { id: 're-3', categoryId: 'reporting', title: 'Revenue forecast', content: 'The Revenue Forecast tab uses your pipeline data to project future revenue based on deal probability and expected close dates...' },
  { id: 're-4', categoryId: 'reporting', title: 'Exporting reports', content: 'Use the Export button (top right of Reports) to download a PDF or CSV version of the active report tab...' },
  { id: 're-5', categoryId: 'reporting', title: 'Custom date ranges', content: 'Use the date range picker at the top of each report to filter data by a specific period...' },
  // Integrations (5)
  { id: 'in-1', categoryId: 'integrations', title: 'Connecting Gmail', content: 'Go to Settings > Integrations and click Connect next to Gmail. Sign in with your Google account and grant the required permissions...' },
  { id: 'in-2', categoryId: 'integrations', title: 'Connecting Slack', content: 'In Settings > Integrations, click Connect next to Slack. Select your workspace and choose which channels to post CRM notifications to...' },
  { id: 'in-3', categoryId: 'integrations', title: 'Using the REST API', content: 'Go to Settings > Security > API Keys to create an API key. Use this key in the Authorization header: Bearer {key}. See our API docs for endpoints...' },
  { id: 'in-4', categoryId: 'integrations', title: 'Zapier integration', content: 'Connect via Settings > Integrations > Zapier. Use the CRM Tool Zapier app to trigger actions in 5,000+ other apps...' },
  { id: 'in-5', categoryId: 'integrations', title: 'Webhook configuration', content: 'Set up webhooks to push real-time events to your own endpoint. Go to Settings > Security > API Keys and configure a webhook URL...' },
]
