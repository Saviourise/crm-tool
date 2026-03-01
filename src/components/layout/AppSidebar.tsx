import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  TrendingUp,
  CheckSquare,
  Inbox,
  Mail,
  BarChart3,
  UserCog,
  Settings,
  Zap,
  Building2,
  CalendarDays,
  HelpCircle,
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
import { Badge } from '@/components/ui/badge'
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
    title: 'Companies',
    icon: Building2,
    url: ROUTES.COMPANIES,
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
    title: 'Calendar',
    icon: CalendarDays,
    url: ROUTES.CALENDAR,
  },
  {
    title: 'Communication',
    icon: Inbox,
    url: ROUTES.COMMUNICATION,
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
    title: 'Users',
    icon: UserCog,
    url: ROUTES.USERS,
  },
  {
    title: 'Help',
    icon: HelpCircle,
    url: ROUTES.HELP,
  },
  {
    title: 'Settings',
    icon: Settings,
    url: ROUTES.SETTINGS,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  function goToBilling() {
    navigate(`${ROUTES.SETTINGS}?section=billing`)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-5 group-data-[collapsible=icon]:px-4 group-data-[collapsible=icon]:py-6">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">CRM Tool</span>
            <span className="text-xs text-muted-foreground">Professional</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0 py-4">
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-2 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-3">
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:w-full">
              {menuItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== ROUTES.DASHBOARD && location.pathname.startsWith(item.url + '/'))
                return (
                  <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
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
      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        {/* Expanded: plan card */}
        <div className="group-data-[collapsible=icon]:hidden rounded-lg border bg-muted/30 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">Professional</span>
            </div>
            <Badge variant="outline" className="text-xs h-5 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
              Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            5 members · 10,000 contacts
          </p>
          <Button
            size="sm"
            className="w-full h-7 text-xs"
            onClick={goToBilling}
          >
            Upgrade Plan
          </Button>
        </div>
        {/* Collapsed: icon button */}
        <Button
          variant="outline"
          size="icon"
          className="hidden group-data-[collapsible=icon]:flex h-11 w-11"
          onClick={goToBilling}
        >
          <Zap className="h-5 w-5" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
