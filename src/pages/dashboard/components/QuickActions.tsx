import { UserPlus, Users, CheckSquare, BarChart3, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
  {
    id: 'create-lead',
    label: 'Create New Lead',
    icon: UserPlus,
    variant: 'default' as const,
  },
  {
    id: 'add-contact',
    label: 'Add Contact',
    icon: Users,
    variant: 'outline' as const,
  },
  {
    id: 'new-task',
    label: 'New Task',
    icon: CheckSquare,
    variant: 'outline' as const,
  },
  {
    id: 'schedule-call',
    label: 'Schedule Call',
    icon: Phone,
    variant: 'outline' as const,
  },
  {
    id: 'send-email',
    label: 'Send Campaign',
    icon: Mail,
    variant: 'outline' as const,
  },
  {
    id: 'view-reports',
    label: 'View Analytics',
    icon: BarChart3,
    variant: 'outline' as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            className="w-full justify-start"
            size="lg"
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
