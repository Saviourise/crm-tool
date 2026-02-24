import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  TrendingUp,
  CheckSquare,
  Mail,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/router/routes'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: ROUTES.DASHBOARD,
  },
  {
    title: 'Contacts',
    icon: Users,
    url: ROUTES.CONTACTS,
  },
  {
    title: 'Leads',
    icon: UserPlus,
    url: ROUTES.LEADS,
  },
  {
    title: 'Pipeline',
    icon: TrendingUp,
    url: ROUTES.PIPELINE,
  },
  {
    title: 'Tasks',
    icon: CheckSquare,
    url: ROUTES.TASKS,
  },
  {
    title: 'Marketing',
    icon: Mail,
    url: ROUTES.MARKETING,
  },
  {
    title: 'Reports',
    icon: BarChart3,
    url: ROUTES.REPORTS,
  },
  {
    title: 'Settings',
    icon: Settings,
    url: ROUTES.SETTINGS,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-5 group-data-[collapsible=icon]:px-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">CRM Tool</span>
            <span className="text-xs text-muted-foreground">Pro Plan</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:text-center">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-10 px-3 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-all duration-200"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 group-data-[collapsible=icon]:p-3">
        <Button variant="outline" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" size="sm">
          <Zap className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Upgrade Plan</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
