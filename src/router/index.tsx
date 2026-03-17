import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { ROUTES } from './routes'
import { RequireAuth, RequireOnboarding, RequirePermission, RequireFeature } from '@/auth/guards'
import type { Permission, Feature } from '@/auth/types'

function RootLayout() {
  return <Outlet />
}

// Layout
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))

// Auth pages (public)
const LoginPage = lazy(() => import('@/pages/auth/Login'))
const SignupPage = lazy(() => import('@/pages/auth/Signup'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'))
const VerifyOTPPage = lazy(() => import('@/pages/auth/VerifyOTP'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPassword'))
const InviteAcceptPage = lazy(() => import('@/pages/auth/InviteAccept'))
const OnboardingPage = lazy(() => import('@/pages/onboarding'))
const OnboardingCompletePage = lazy(() => import('@/pages/onboarding/complete'))
const OnboardingPaymentSuccessPage = lazy(() => import('@/pages/onboarding/payment-success'))

// Pages
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Contacts = lazy(() => import('@/pages/contacts'))
const ContactDetail = lazy(() => import('@/pages/contacts/detail'))
const Leads = lazy(() => import('@/pages/leads'))
const LeadDetail = lazy(() => import('@/pages/leads/detail'))
const Pipeline = lazy(() => import('@/pages/pipeline'))
const DealDetail = lazy(() => import('@/pages/pipeline/detail'))
const Companies = lazy(() => import('@/pages/companies'))
const CompanyDetail = lazy(() => import('@/pages/companies/detail'))
const Tasks = lazy(() => import('@/pages/tasks'))
const Calendar = lazy(() => import('@/pages/calendar'))
const Communication = lazy(() => import('@/pages/communication'))
const Marketing = lazy(() => import('@/pages/marketing'))
const Reports = lazy(() => import('@/pages/reports'))
const UserManagement = lazy(() => import('@/pages/users'))
const Help = lazy(() => import('@/pages/help'))
const Activity = lazy(() => import('@/pages/activity'))
const Notifications = lazy(() => import('@/pages/notifications'))
const Settings = lazy(() => import('@/pages/settings'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

// Suspense wrapper shorthand
function P({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// Composes plan gate (outer) + permission gate (inner).
// Plan missing → UpgradePrompt. Has plan, missing permission → AccessDenied.
function Guard({
  children,
  feature,
  permission,
}: {
  children: ReactNode
  feature?: Feature
  permission?: Permission
}) {
  const inner = permission ? (
    <RequirePermission permission={permission}>{children}</RequirePermission>
  ) : (
    <>{children}</>
  )
  return feature ? <RequireFeature feature={feature}>{inner}</RequireFeature> : inner
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ─── Public auth routes (no app layout) ─────────────────────────────────
      // Use 'login' not '/login' so path '/' doesn't match /login as prefix
      {
        path: 'login',
        element: <P><LoginPage /></P>,
      },
  {
    path: 'signup',
    element: <P><SignupPage /></P>,
  },
  {
    path: 'forgot-password',
    element: <P><ForgotPasswordPage /></P>,
  },
  {
    path: 'verify-otp',
    element: <P><VerifyOTPPage /></P>,
  },
  {
    path: 'reset-password',
    element: <P><ResetPasswordPage /></P>,
  },
  {
    path: 'invite/:token',
    element: <P><InviteAcceptPage /></P>,
  },
  {
    path: 'onboarding',
    element: <P><OnboardingPage /></P>,
  },
      {
        path: 'onboarding/complete',
        element: <P><OnboardingCompletePage /></P>,
      },
      {
        path: 'onboarding/payment-success',
        element: <P><OnboardingPaymentSuccessPage /></P>,
      },
      {
        path: 'onboarding/plan',
        element: <Navigate to="/onboarding" replace />,
      },

      // ─── Protected app routes (require auth + onboarding + RBAC) ─────────────
      {
        path: ROUTES.HOME,
    element: (
      <P>
        <RequireAuth>
          <RequireOnboarding>
            <AppLayout />
          </RequireOnboarding>
        </RequireAuth>
      </P>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },

      // Dashboard — all authenticated roles
      {
        path: ROUTES.DASHBOARD,
        element: <P><Guard permission="dashboard.view"><Dashboard /></Guard></P>,
      },

      // Contacts — all roles have contacts.view
      {
        path: ROUTES.CONTACTS,
        element: <P><Guard permission="contacts.view"><Contacts /></Guard></P>,
      },
      {
        path: '/contacts/:id',
        element: <P><Guard permission="contacts.view"><ContactDetail /></Guard></P>,
      },

      // Leads — all roles have leads.view
      {
        path: ROUTES.LEADS,
        element: <P><Guard permission="leads.view"><Leads /></Guard></P>,
      },
      {
        path: '/leads/:id',
        element: <P><Guard permission="leads.view"><LeadDetail /></Guard></P>,
      },

      // Pipeline — requires basic plan + pipeline.view
      {
        path: ROUTES.PIPELINE,
        element: <P><Guard feature="pipeline" permission="pipeline.view"><Pipeline /></Guard></P>,
      },
      {
        path: '/pipeline/:id',
        element: <P><Guard feature="pipeline" permission="pipeline.view"><DealDetail /></Guard></P>,
      },

      // Companies — requires basic plan + companies.view
      {
        path: ROUTES.COMPANIES,
        element: <P><Guard feature="companies" permission="companies.view"><Companies /></Guard></P>,
      },
      {
        path: '/companies/:id',
        element: <P><Guard feature="companies" permission="companies.view"><CompanyDetail /></Guard></P>,
      },

      // Tasks — all roles have tasks.view
      {
        path: ROUTES.TASKS,
        element: <P><Guard permission="tasks.view"><Tasks /></Guard></P>,
      },

      // Calendar — requires basic plan + calendar.view
      {
        path: ROUTES.CALENDAR,
        element: <P><Guard feature="calendar" permission="calendar.view"><Calendar /></Guard></P>,
      },

      // Communication — requires basic plan + communication.view
      {
        path: ROUTES.COMMUNICATION,
        element: <P><Guard feature="communication" permission="communication.view"><Communication /></Guard></P>,
      },

      // Marketing — requires professional plan + marketing.view (sales-rep/viewer blocked)
      {
        path: ROUTES.MARKETING,
        element: <P><Guard feature="marketing" permission="marketing.view"><Marketing /></Guard></P>,
      },

      // Reports — requires professional plan + reports.view
      {
        path: ROUTES.REPORTS,
        element: <P><Guard feature="reports" permission="reports.view"><Reports /></Guard></P>,
      },

      // Users — requires users.view (sales-rep, marketing, viewer blocked)
      {
        path: ROUTES.USERS,
        element: <P><Guard permission="users.view"><UserManagement /></Guard></P>,
      },

      // Help — open to all authenticated users
      {
        path: ROUTES.HELP,
        element: <P><Help /></P>,
      },

      // Activity log — open to all authenticated users
      {
        path: ROUTES.ACTIVITY,
        element: <P><Activity /></P>,
      },

      // Notifications — open to all authenticated users
      {
        path: ROUTES.NOTIFICATIONS,
        element: <P><Notifications /></P>,
      },

      // Settings — requires settings.view
      {
        path: ROUTES.SETTINGS,
        element: <P><Guard permission="settings.view"><Settings /></Guard></P>,
      },
    ],
  },
    ],
  }
])
