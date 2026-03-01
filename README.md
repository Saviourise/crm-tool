# NexaCRM

A modern, AI-powered Customer Relationship Management platform built for sales teams, marketers, and managers. NexaCRM combines a full CRM feature set with an integrated AI Hub — covering lead scoring, content generation, voice agents, social scheduling, and a live AI chat widget — all under a single subscription model with fine-grained role-based access control.

---

## Features

### Core CRM
- **Contacts & Companies** — manage customer profiles, company hierarchies, interaction history, CSV import/export
- **Lead Management** — capture, score, and route leads with assignment rules (round robin, territory, score-based)
- **Pipeline** — multi-pipeline Kanban board with drag-and-drop, list view, stage forecasting, saved views
- **Tasks & Calendar** — task management, reminders, month/week/day calendar views
- **Communication Center** — unified inbox for email (IMAP/SMTP), SMS, calls, and notes per contact
- **Reports** — sales performance, lead analytics, revenue forecasting with PDF/CSV export

### Marketing
- **Email Campaigns** — template builder, bulk send, scheduling, open/click metrics
- **Template Gallery** — reusable email templates with one-click campaign creation
- **AI Content Generator** — Gemini-powered email copy, social posts, blog outlines, ad copy

### AI Hub (Premium)
- **Lead Scoring** — AI-predicted scores (0–100) with next-best-action recommendations per lead
- **Sentiment Analysis** — multichannel sentiment detection on email/SMS threads
- **Follow-Up Suggestions** — context-aware next-action cards per lead
- **Video Generator** — text-to-video with scene templates, voice selection, and resolution presets
- **Social Posting Scheduler** — connect Meta, LinkedIn, Twitter/X, TikTok; AI captions, best-time prediction, engagement heatmap
- **Voice Agents** — AI outbound calling with call scripts, transcription, sentiment logging
- **Live Chat Agent** — embeddable Gemini-powered chat widget; real-time lead capture, auto-creates CRM lead records, escalates to human agents

### Access Control
- **RBAC** — six built-in roles (Super Admin, Admin, Manager, Sales Rep, Marketing, Viewer) with a fully customizable permissions matrix
- **Subscription Plans** — five tiers (Free → Basic → Professional → Premium → Enterprise) gating features at the route and UI level
- **Audit Log** — full action trail with user, entity, IP, and timestamp

### Settings & Admin
- 2FA, SSO (SAML), custom fields, workflow automation, lead routing, data retention, GDPR/CCPA compliance, billing & invoicing, integrations (Google Workspace, Microsoft 365, WhatsApp, Zapier)

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Routing | React Router v7 |
| Tables | TanStack Table v8 |
| Drag & Drop | @dnd-kit/core |
| Date utilities | date-fns v4 + react-day-picker v9 |
| Charts | Recharts |
| Toasts | Sonner |

### Backend (see `docs/BACKEND.md`)
| Layer | Technology |
|---|---|
| Framework | Django 5.x + Django REST Framework 3.x |
| WebSockets | Django Channels 4.x |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis |
| Async tasks | Celery |
| AI | Google Gemini (`google-generativeai`) |
| Telephony | Twilio |
| Auth | JWT via SimpleJWT |
| Storage | AWS S3 |
| Email delivery | SendGrid |
| Payments | Stripe |

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

```bash
git clone <repo-url>
cd crm-tool
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Demo Accounts

The frontend ships with five pre-configured demo accounts to test different access levels. All use the password `demo1234`.

| Email | Role | Plan | What you can see |
|---|---|---|---|
| `admin@demo.com` | Super Admin | Enterprise | Everything |
| `manager@demo.com` | Manager | Professional | All modules except billing settings |
| `sales@demo.com` | Sales Rep | Basic | Contacts, Leads, Pipeline, Tasks, Calendar, Communication |
| `marketing@demo.com` | Marketing | Professional | Marketing hub, Contacts (read), Reports |
| `viewer@demo.com` | Viewer | Free | Dashboard, Contacts, Leads, Tasks only |

> Attempting to access a plan-gated or permission-gated route directly via URL shows the appropriate **Upgrade Required** or **Access Denied** screen.

---

## Project Structure

```
src/
├── auth/                  # Auth context, guards, RBAC, demo users
│   ├── context.tsx        # AuthProvider + useAuth() hook
│   ├── guards.tsx         # RequireAuth, RequirePermission, RequireFeature
│   ├── permissions.ts     # Role permission map + plan feature flags
│   ├── types.ts           # Permission, Feature, PlanId types
│   └── demo-users.ts      # Demo account definitions
├── components/
│   ├── common/            # DataTable, DatePicker, NewTaskDialog, LogActivityDialog, CSVImportDialog
│   ├── layout/            # AppLayout, AppSidebar, AppHeader
│   └── ui/                # shadcn/ui components
├── pages/
│   ├── auth/              # Login, Signup, ForgotPassword, VerifyOTP, ResetPassword, InviteAccept
│   ├── dashboard/
│   ├── contacts/          # List + detail page
│   ├── companies/         # List + detail page
│   ├── leads/             # List + detail page
│   ├── pipeline/          # Kanban + list + deal detail
│   ├── tasks/
│   ├── calendar/
│   ├── communication/
│   ├── marketing/         # Campaigns, Templates, AI Hub tabs
│   ├── reports/
│   ├── users/             # Users, Roles, Permissions tabs
│   ├── settings/
│   ├── help/
│   └── notifications/
├── router/
│   ├── index.tsx          # Route definitions with RBAC guards
│   └── routes.ts          # ROUTES constants
└── lib/
    ├── utils.ts
    └── chatStore.ts       # Global chat widget state
```

---

## Access Control

Every route is protected by two guard layers composed in `src/router/index.tsx`:

1. **`RequireAuth`** — redirects unauthenticated users to `/login`
2. **`RequireFeature`** — shows an Upgrade prompt if the user's plan doesn't include the feature
3. **`RequirePermission`** — shows an Access Denied screen if the role lacks the required permission

Feature gates apply before permission gates. The sidebar also hides items the user cannot access — but the route guard is the authoritative enforcement.

---

## Backend Documentation

See [`docs/BACKEND.md`](docs/BACKEND.md) for the full Django REST Framework + PostgreSQL backend specification including:
- Authentication & JWT strategy
- RBAC roles, permissions, and plan feature flags
- Database model overview
- All API endpoints with request/response DTOs for all 20 modules
- AI Hub — full Gemini integration spec for all 9 AI sub-tools (content, scoring, sentiment, suggestions, video, social, voice, live chat, credits)
- Django app structure, Celery tasks, WebSocket routing, middleware, and environment variables

---

## License

Private — all rights reserved.
