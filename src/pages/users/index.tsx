import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { UsersTab } from './components/UsersTab'
import { RolesTab } from './components/RolesTab'
import { PermissionsTab } from './components/PermissionsTab'
import { PERMISSIONS } from './data'
import { mapApiRoleToRole, buildPermissionMatrix, matrixColumnToPermissions } from './apiMappers'
import { usersApi } from '@/api/users'
import { WORKSPACE_USERS_QUERY_KEY } from '@/hooks/useWorkspaceUsers'
import type { Role, PermissionMatrix } from './typings'
import { useAuth } from '@/auth/context'

export const ROLES_QUERY_KEY = ['roles', 'list'] as const

type UserMgmtTab = 'users' | 'roles' | 'permissions'

const ALL_TABS: { id: UserMgmtTab; label: string }[] = [
  { id: 'users',       label: 'Users' },
  { id: 'roles',       label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
]

export default function UserManagement() {
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const canEditUsers = can('users.edit')
  const TABS = ALL_TABS.filter((t) => t.id === 'users' || canEditUsers)

  const [activeTab, setActiveTab] = useState<UserMgmtTab>('users')
  const [localPermissions, setLocalPermissions] = useState<PermissionMatrix | null>(null)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  // ─── Roles query ─────────────────────────────────────────────────────────────

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn:  () => usersApi.listRoles(),
  })

  const apiRoles = rolesData?.data ?? []

  const roles: Role[] = (() => {
    let customIdx = 0
    return apiRoles.map((r) => {
      const role = mapApiRoleToRole(r, customIdx)
      if (!r.is_system) customIdx++
      return role
    })
  })()

  const serverPermissions = apiRoles.length > 0
    ? buildPermissionMatrix(apiRoles)
    : PERMISSIONS
  const permissions = localPermissions ?? serverPermissions

  // ─── Role mutations ───────────────────────────────────────────────────────────

  const { mutateAsync: createRoleMutateAsync, isPending: isCreatingRole } = useMutation({
    mutationFn: (data: Pick<Role, 'name' | 'description'>) =>
      usersApi.createRole({ name: data.name, description: data.description, permissions: [] }),
    onSuccess: (res) => {
      toast.success(`Role "${res.data.name}" created`)
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
    },
    onError: () => toast.error('Failed to create role'),
  })

  const { mutateAsync: updateRoleMutateAsync, isPending: isUpdatingRole } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Pick<Role, 'name' | 'description'> }) =>
      usersApi.updateRole(id, { name: data.name, description: data.description }),
    onSuccess: () => {
      toast.success('Role updated')
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
    },
    onError: () => toast.error('Failed to update role'),
  })

  const { mutate: deleteRoleMutation, isPending: isDeletingRole } = useMutation({
    mutationFn: (id: string) => usersApi.deleteRole(id),
    onSuccess: (_, id) => {
      const role = roles.find((r) => r.id === id)
      toast.success(`Role "${role?.name ?? ''}" deleted`)
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
    },
    onError: () => toast.error('Failed to delete role'),
  })

  // ─── Permissions save ─────────────────────────────────────────────────────────

  const handleSavePermissions = async (updated: PermissionMatrix) => {
    setLocalPermissions(updated)
    const customRoles = apiRoles.filter((r) => !r.is_system)
    if (customRoles.length === 0) {
      // System-role permissions cannot be updated via API — local only
      toast.success('Permissions saved')
      return
    }
    setIsSavingPermissions(true)
    try {
      await Promise.allSettled(
        customRoles.map((r) =>
          usersApi.updateRole(r.id, {
            permissions: matrixColumnToPermissions(updated, r.id),
          })
        )
      )
      toast.success('Permissions saved')
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_USERS_QUERY_KEY })
    } catch {
      toast.error('Some permissions could not be saved')
    } finally {
      setIsSavingPermissions(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
          <UserCog className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and access permissions.
          </p>
        </div>
      </div>

      <div className="border-b overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <UsersTab roles={roles} isLoadingRoles={isLoadingRoles} />
      )}
      {activeTab === 'roles' && canEditUsers && (
        <RolesTab
          roles={roles}
          isLoading={isLoadingRoles}
          isCreating={isCreatingRole}
          isUpdating={isUpdatingRole}
          isDeleting={isDeletingRole}
          onCreate={(data) => createRoleMutateAsync(data)}
          onUpdate={(id, data) => updateRoleMutateAsync({ id, data })}
          onDelete={(role) => deleteRoleMutation(role.id)}
        />
      )}
      {activeTab === 'permissions' && canEditUsers && (
        <PermissionsTab
          roles={roles}
          permissions={permissions}
          defaultPermissions={serverPermissions}
          isSaving={isSavingPermissions}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  )
}
