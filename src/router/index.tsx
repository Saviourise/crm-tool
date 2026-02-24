import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ROUTES } from './routes'

// Layout
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))

// Pages
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Contacts = lazy(() => import('@/pages/contacts'))
const Leads = lazy(() => import('@/pages/leads'))
const Pipeline = lazy(() => import('@/pages/pipeline'))
const Tasks = lazy(() => import('@/pages/tasks'))
const Marketing = lazy(() => import('@/pages/marketing'))
const Reports = lazy(() => import('@/pages/reports'))
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
        path: ROUTES.LEADS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Leads />
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
        path: ROUTES.TASKS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Tasks />
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
