import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  maxWidth?: 'md' | 'lg'
  contentAlign?: 'center' | 'top'
}

export function AuthLayout({
  children,
  maxWidth = 'md',
  contentAlign = 'center',
}: AuthLayoutProps) {
  const maxWidthClass = maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md'
  const contentAlignClass = contentAlign === 'top'
    ? 'items-start justify-start pt-6'
    : 'items-center justify-center'

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="flex flex-col w-full lg:w-[54%] min-h-screen bg-background">
        {/* Logo */}
        <div className="px-8 sm:px-12 pt-8 shrink-0">
          <Link to="/login" className="inline-flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">CRM Tool</span>
          </Link>
        </div>

        {/* Content */}
        <div className={`flex-1 flex flex-col px-8 sm:px-12 py-8 ${contentAlignClass}`}>
          <div className={`w-full ${maxWidthClass}`}>
            {children}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="hidden lg:flex lg:w-[46%] lg:h-screen lg:sticky lg:top-0 shrink-0 relative overflow-hidden bg-linear-to-br from-blue-50 via-indigo-100 to-indigo-200 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-800">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-300/30 dark:bg-blue-500/10 blur-3xl" />

        {/* Floating app screenshot */}
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="w-[92%] h-[76%] -mr-8 rounded-l-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] border border-white/70 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 -rotate-2">
            {/* Light mode screenshot */}
            <img
              src="/contacts-light.png"
              alt="CRM App Preview"
              className="w-full h-full object-cover object-top-left dark:hidden"
              draggable={false}
            />
            {/* Dark mode screenshot */}
            <img
              src="/contacts-dark.png"
              alt="CRM App Preview"
              className="w-full h-full object-cover object-top-left hidden dark:block"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
