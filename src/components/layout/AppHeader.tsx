import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from '@/components/common/UserMenu'
import { NotificationsBell } from '@/components/common/NotificationsBell'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-18 items-center bg-sidebar gap-4 border-b px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts, leads, deals..."
            className="pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  )
}
