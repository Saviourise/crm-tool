import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './auth/context'
import { QueryProvider } from './providers/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  )
}

export default App
