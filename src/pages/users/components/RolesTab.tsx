import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Role } from '../typings'
import { cn } from '@/lib/utils'

// ─── Role Form ─────────────────────────────────────────────────────────────────

function RoleForm({
  name, setName,
  description, setDescription,
}: {
  name: string
  setName: (v: string) => void
  description: string
  setDescription: (v: string) => void
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="role-name">Role Name</Label>
        <Input
          id="role-name"
          placeholder="e.g. Regional Manager"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role-description">Description</Label>
        <textarea
          id="role-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe what this role is responsible for..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Module-level permissions can be configured in the Permissions tab after the role is created.
      </p>
    </div>
  )
}

// ─── Create Role Dialog ────────────────────────────────────────────────────────

function CreateRoleDialog({
  open,
  onClose,
  onCreate,
  isCreating,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: Pick<Role, 'name' | 'description'>) => Promise<unknown>
  isCreating: boolean
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!name.trim() || isCreating) return
    try {
      await onCreate({ name: name.trim(), description: description.trim() })
      handleClose()
    } catch {
      // stay open — error toast already shown by mutation's onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
        </DialogHeader>
        <RoleForm
          name={name} setName={setName}
          description={description} setDescription={setDescription}
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>Cancel</Button>
          <Button disabled={!name.trim() || isCreating} onClick={handleSubmit}>
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Role Dialog ──────────────────────────────────────────────────────────

function EditRoleDialog({
  role,
  onClose,
  onSave,
  isUpdating,
}: {
  role: Role | null
  onClose: () => void
  onSave: (id: string, data: Pick<Role, 'name' | 'description'>) => Promise<unknown>
  isUpdating: boolean
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (role) {
      setName(role.name)
      setDescription(role.description)
    }
  }, [role?.id])

  if (!role) return null

  const handleSubmit = async () => {
    if (!name.trim() || isUpdating) return
    try {
      await onSave(role.id, { name: name.trim(), description: description.trim() })
      onClose()
    } catch {
      // stay open — error toast already shown by mutation's onError
    }
  }

  return (
    <Dialog open={!!role} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <RoleForm
          name={name} setName={setName}
          description={description} setDescription={setDescription}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
          <Button disabled={!name.trim() || isUpdating} onClick={handleSubmit}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Role Card ─────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  onEdit,
  onDelete,
  isDeleting,
}: {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  isDeleting: boolean
}) {
  return (
    <Card className={cn('border-l-4', role.borderColor)}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className={cn('text-xs capitalize shrink-0', role.color)}>
              {role.name.replace(/-/g, ' ')}
            </Badge>
            {role.isSystem && (
              <span className="text-xs text-muted-foreground shrink-0">System</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Users className="h-3.5 w-3.5" />
            <span>{role.userCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
        <div className="flex items-center gap-2 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onEdit(role)}
            disabled={isDeleting}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(role)}
            disabled={isDeleting}
          >
            {isDeleting
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Trash2 className="h-3 w-3" />
            }
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function RoleSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="h-5 w-24 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-7 w-20 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function RolesTab({
  roles,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: {
  roles: Role[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  onCreate: (data: Pick<Role, 'name' | 'description'>) => Promise<unknown>
  onUpdate: (id: string, data: Pick<Role, 'name' | 'description'>) => Promise<unknown>
  onDelete: (role: Role) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (role: Role) => {
    setDeletingId(role.id)
    onDelete(role)
  }

  const systemRoles = roles.filter((r) => r.isSystem)
  const customRoles = roles.filter((r) => !r.isSystem)

  return (
    <div className="space-y-6">
      {/* System Roles */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">System Roles</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Built-in roles — edit or delete as needed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <RoleSkeleton key={i} />)
            : systemRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={setEditRole}
                onDelete={handleDelete}
                isDeleting={isDeleting && deletingId === role.id}
              />
            ))
          }
        </div>
      </div>

      {/* Custom Roles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Custom Roles</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Roles tailored to your team's structure.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Role
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <RoleSkeleton key={i} />)}
          </div>
        ) : customRoles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={setEditRole}
                onDelete={handleDelete}
                isDeleting={isDeleting && deletingId === role.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">No custom roles yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a custom role to define specific access levels.
              </p>
              <Button size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Role
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateRoleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={onCreate}
        isCreating={isCreating}
      />
      <EditRoleDialog
        role={editRole}
        onClose={() => setEditRole(null)}
        onSave={onUpdate}
        isUpdating={isUpdating}
      />
    </div>
  )
}
