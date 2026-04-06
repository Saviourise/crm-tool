import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallbackContent } from '@/components/error/ErrorFallbackContent'

type AppErrorBoundaryProps = {
  children: ReactNode
  variant?: 'fullscreen' | 'embedded'
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(_error: Error): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, errorInfo.componentStack)
  }

  reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackContent
          variant={this.props.variant ?? 'embedded'}
          onRetry={this.reset}
        />
      )
    }
    return this.props.children
  }
}
