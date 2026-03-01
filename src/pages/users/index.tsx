import { useState } from 'react'
import { UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UsersTab } from './components/UsersTab'
import { RolesTab } from './components/RolesTab'
import { PermissionsTab } from './components/PermissionsTab'
import { MOCK_ROLES, PERMISSIONS } from './data'
import type { Role, PermissionMatrix, AppModule } from './typings'

type UserMgmtTab = 'users' | 'roles' | 'permissions'

const TABS: { id: UserMgmtTab; label: string }[] = [
  { id: 'users',       label: 'Users' },
  { id: 'roles',       label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
]

const CUSTOM_ROLE_COLORS = [
  { color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800',           borderColor: 'border-l-teal-500' },
  { color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800', borderColor: 'border-l-indigo-500' },
  { color: 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/50 dark:text-lime-400 dark:border-lime-800',             borderColor: 'border-l-lime-500' },
  { color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800',                   borderColor: 'border-l-sky-500' },
]

function clonePermissions(matrix: PermissionMatrix): PermissionMatrix {
  return Object.fromEntries(
    Object.entries(matrix).map(([mod, roles]) => [
      mod,
      Object.fromEntries(Object.entries(roles).map(([role, actions]) => [role, [...actions]])),
    ])
  ) as PermissionMatrix
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<UserMgmtTab>('users')
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [permissions, setPermissions] = useState<PermissionMatrix>(() => clonePermissions(PERMISSIONS))

  const handleCreateRole = (data: Pick<Role, 'name' | 'description'>) => {
    const customCount = roles.filter((r) => !r.isSystem).length
    const colorSet = CUSTOM_ROLE_COLORS[customCount % CUSTOM_ROLE_COLORS.length]
    const newRole: Role = {
      id: `custom-${Date.now()}`,
      ...data,
      isSystem: false,
      color: colorSet.color,
      borderColor: colorSet.borderColor,
      userCount: 0,
    }
    setRoles((prev) => [...prev, newRole])
    // Initialize empty permissions for the new role across all modules
    setPermissions((prev) => {
      const next = clonePermissions(prev)
      ;(Object.keys(next) as AppModule[]).forEach((mod) => {
        next[mod][newRole.id] = []
      })
      return next
    })
  }

  const handleUpdateRole = (id: string, data: Pick<Role, 'name' | 'description'>) => {
    setRoles((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r))
  }

  const handleDeleteRole = (role: Role) => {
    setRoles((prev) => prev.filter((r) => r.id !== role.id))
    // Remove the role's column from the permissions matrix
    setPermissions((prev) => {
      const next = clonePermissions(prev)
      ;(Object.keys(next) as AppModule[]).forEach((mod) => {
        delete next[mod][role.id]
      })
      return next
    })
  }

  const handleSavePermissions = (updated: PermissionMatrix) => {
    setPermissions(updated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
          <UserCog className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and access permissions.
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b">
        <div className="flex gap-1">
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

      {/* Tab content */}
      {activeTab === 'users' && (
        <UsersTab roles={roles} />
      )}
      {activeTab === 'roles' && (
        <RolesTab
          roles={roles}
          onCreate={handleCreateRole}
          onUpdate={handleUpdateRole}
          onDelete={handleDeleteRole}
        />
      )}
      {activeTab === 'permissions' && (
        <PermissionsTab
          roles={roles}
          permissions={permissions}
          defaultPermissions={PERMISSIONS}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  )
}
