import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ROUTES } from './routes'

// Layout
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))

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
const Settings = lazy(() => import('@/pages/settings'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <Suspense fallback={<PageLoader />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CONTACTS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Contacts />
          </Suspense>
        ),
      },
      {
        path: '/contacts/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ContactDetail />
          </Suspense>
        ),
      },
      {
        path: ROUTES.LEADS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Leads />
          </Suspense>
        ),
      },
      {
        path: '/leads/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LeadDetail />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PIPELINE,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Pipeline />
          </Suspense>
        ),
      },
      {
        path: '/pipeline/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DealDetail />
          </Suspense>
        ),
      },
      {
        path: ROUTES.COMPANIES,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Companies />
          </Suspense>
        ),
      },
      {
        path: '/companies/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CompanyDetail />
          </Suspense>
        ),
      },
      {
        path: ROUTES.TASKS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Tasks />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CALENDAR,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Calendar />
          </Suspense>
        ),
      },
      {
        path: ROUTES.COMMUNICATION,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Communication />
          </Suspense>
        ),
      },
      {
        path: ROUTES.MARKETING,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Marketing />
          </Suspense>
        ),
      },
      {
        path: ROUTES.REPORTS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: ROUTES.USERS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <UserManagement />
          </Suspense>
        ),
      },
      {
        path: ROUTES.HELP,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Help />
          </Suspense>
        ),
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
])
