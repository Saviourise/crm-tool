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
  LogOut,
  Activity,
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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/context'
import { planMeetsMinimum } from '@/auth/permissions'
import type { PlanId, Permission } from '@/auth/types'
import { PLAN_ORDER } from '@/auth/types'

// ─── Nav structure ───────────────────────────────────────────────────────────

interface NavItem {
  title: string
  icon: React.ElementType
  url: string
  planRequired?: PlanId
  viewPermission?: Permission
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'CRM',
    items: [
      { title: 'Dashboard',    icon: LayoutDashboard, url: ROUTES.DASHBOARD,      viewPermission: 'dashboard.view' },
      { title: 'Contacts',     icon: Users,           url: ROUTES.CONTACTS,       viewPermission: 'contacts.view' },
      { title: 'Companies',    icon: Building2,       url: ROUTES.COMPANIES,      planRequired: 'basic',        viewPermission: 'companies.view' },
      { title: 'Leads',        icon: UserPlus,        url: ROUTES.LEADS,          viewPermission: 'leads.view' },
      { title: 'Pipeline',     icon: TrendingUp,      url: ROUTES.PIPELINE,       planRequired: 'basic',        viewPermission: 'pipeline.view' },
      { title: 'Tasks',        icon: CheckSquare,     url: ROUTES.TASKS,          viewPermission: 'tasks.view' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { title: 'Activity',      icon: Activity,     url: ROUTES.ACTIVITY },
      { title: 'Calendar',      icon: CalendarDays, url: ROUTES.CALENDAR,      planRequired: 'basic',        viewPermission: 'calendar.view' },
      { title: 'Communication', icon: Inbox,        url: ROUTES.COMMUNICATION, planRequired: 'basic',        viewPermission: 'communication.view' },
      { title: 'Marketing',     icon: Mail,         url: ROUTES.MARKETING,     planRequired: 'professional', viewPermission: 'marketing.view' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { title: 'Reports', icon: BarChart3, url: ROUTES.REPORTS, planRequired: 'professional', viewPermission: 'reports.view' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Users',    icon: UserCog,    url: ROUTES.USERS,    viewPermission: 'users.view' },
      { title: 'Help',     icon: HelpCircle, url: ROUTES.HELP },
      { title: 'Settings', icon: Settings,   url: ROUTES.SETTINGS, viewPermission: 'settings.view' },
    ],
  },
]


// ─── Component ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, can } = useAuth()

  if (!user) return null

  const planLabel = user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
  const isTopPlan = PLAN_ORDER.indexOf(user.plan) === PLAN_ORDER.length - 1

  function isVisible(item: NavItem): boolean {
    if (item.planRequired && !planMeetsMinimum(user!.plan, item.planRequired)) return false
    if (item.viewPermission && !can(item.viewPermission)) return false
    return true
  }

  function goToBilling() {
    navigate(`${ROUTES.SETTINGS}?section=billing`)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Sidebar collapsible="icon">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <SidebarHeader className="border-b px-4 py-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center px-2 group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-none">CRM Tool</span>
            <span className="text-xs text-muted-foreground mt-0.5">{planLabel}</span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <SidebarContent className="py-2 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(isVisible)
          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={group.label} className="px-2 py-0 group-data-[collapsible=icon]:px-1">
              <SidebarGroupLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      location.pathname === item.url ||
                      (item.url !== ROUTES.DASHBOARD && location.pathname.startsWith(item.url + '/'))

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className={cn(
                            'h-9 rounded-lg transition-colors duration-150',
                            'group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto',
                            isActive
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Link to={item.url} className="flex items-center gap-2.5 px-2 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden flex-1 min-w-0 truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              {gi < NAV_GROUPS.length - 1 && (
                <div className="mt-1 group-data-[collapsible=icon]:mt-1">
                  <SidebarSeparator className="mx-2 group-data-[collapsible=icon]:mx-1" />
                </div>
              )}
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <SidebarFooter className="border-t p-2 group-data-[collapsible=icon]:p-1">
        {/* Expanded: user + plan card */}
        <div className="group-data-[collapsible=icon]:hidden space-y-2">
          {/* User row — click to go to profile */}
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.SETTINGS}?section=profile`)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-white text-xs font-semibold" style={{ backgroundColor: user.avatarColor }}>
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-none truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); handleLogout() }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </button>

          {/* Plan card */}
          <div className="rounded-lg border bg-muted/30 px-3 py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold">{planLabel}</span>
              </div>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                Active
              </Badge>
            </div>
            {!isTopPlan && (
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                onClick={goToBilling}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>

        {/* Collapsed: avatar + zap icon */}
        <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:py-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="text-white text-xs font-semibold" style={{ backgroundColor: user.avatarColor }}>
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">
              {user.name} — {planLabel}
            </TooltipContent>
          </Tooltip>
          {!isTopPlan && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={goToBilling}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Upgrade Plan</TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
