import { UserPlus, Users, CheckSquare, BarChart3, Phone, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateLeadDialog } from '@/components/common/CreateLeadDialog'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/auth/context'

export function QuickActions() {
  const navigate = useNavigate()
  const { can, hasPlan } = useAuth()

  const canCreateLead    = can('leads.create')
  const canAddContact    = can('contacts.create')
  const canCreateTask    = can('tasks.create')
  const canSendCampaign  = can('marketing.send') && hasPlan('marketing')
  const canViewAnalytics = can('reports.view') && hasPlan('reports')

  const hasAnyAction = canCreateLead || canAddContact || canCreateTask || canSendCampaign || canViewAnalytics

  if (!hasAnyAction) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {canCreateLead && (
          <CreateLeadDialog
            trigger={
              <Button variant="default" className="w-full justify-start" size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Lead
              </Button>
            }
          />
        )}

        {canAddContact && (
          <AddContactDialog
            trigger={
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            }
          />
        )}

        {canCreateTask && (
          <NewTaskDialog
            trigger={
              <Button variant="outline" className="w-full justify-start" size="lg">
                <CheckSquare className="mr-2 h-4 w-4" />
                New Task
              </Button>
            }
          />
        )}

        {canCreateTask && (
          <Button
            variant="outline"
            className="w-full justify-start"
            size="lg"
            onClick={() => navigate(ROUTES.TASKS)}
          >
            <Phone className="mr-2 h-4 w-4" />
            Schedule Call
          </Button>
        )}

        {canSendCampaign && (
          <Button
            variant="outline"
            className="w-full justify-start"
            size="lg"
            onClick={() => navigate(ROUTES.MARKETING)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Campaign
          </Button>
        )}

        {canViewAnalytics && (
          <Button
            variant="outline"
            className="w-full justify-start"
            size="lg"
            onClick={() => navigate(ROUTES.REPORTS)}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
