import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { AppErrorBoundary } from '@/components/error/AppErrorBoundary'

function App() {
  return (
    <QueryProvider>
      <AppErrorBoundary variant="fullscreen">
        <RouterProvider router={router} />
      </AppErrorBoundary>
    </QueryProvider>
  )
}

export default App
