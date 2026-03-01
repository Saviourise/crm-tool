import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from '@/components/common/UserMenu'
import { NotificationsBell } from '@/components/common/NotificationsBell'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center bg-sidebar gap-2 border-b px-3 md:h-[65px] md:gap-4 md:px-6">
      {/* Sidebar trigger — hidden when mobile search is expanded */}
      <SidebarTrigger className={cn('-ml-1 shrink-0', mobileSearchOpen && 'hidden sm:flex')} />

      {/* Desktop search — hidden on mobile */}
      <div className="hidden sm:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts, leads, deals..."
            className="pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      {/* Mobile expanded search bar */}
      {mobileSearchOpen && (
        <div className="flex flex-1 items-center gap-2 sm:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 h-9"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setMobileSearchOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close search</span>
          </Button>
        </div>
      )}

      {/* Right-side actions */}
      <div
        className={cn(
          'flex items-center gap-1 md:gap-2',
          mobileSearchOpen ? 'hidden sm:flex sm:ml-auto' : 'ml-auto'
        )}
      >
        {/* Mobile search trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:hidden"
          onClick={() => setMobileSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <ThemeToggle />
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  )
}
