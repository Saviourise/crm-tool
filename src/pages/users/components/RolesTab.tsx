import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
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
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: Pick<Role, 'name' | 'description'>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
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
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              onCreate({ name: name.trim(), description: description.trim() })
              handleClose()
            }}
          >
            Create Role
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
}: {
  role: Role | null
  onClose: () => void
  onSave: (id: string, data: Pick<Role, 'name' | 'description'>) => void
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              onSave(role.id, { name: name.trim(), description: description.trim() })
              onClose()
            }}
          >
            Save Changes
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
}: {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}) {
  return (
    <Card className={cn('border-l-4', role.borderColor)}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className={cn('text-xs shrink-0', role.color)}>
              {role.name}
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
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(role)}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function RolesTab({
  roles,
  onCreate,
  onUpdate,
  onDelete,
}: {
  roles: Role[]
  onCreate: (data: Pick<Role, 'name' | 'description'>) => void
  onUpdate: (id: string, data: Pick<Role, 'name' | 'description'>) => void
  onDelete: (role: Role) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)

  const handleCreate = (data: Pick<Role, 'name' | 'description'>) => {
    onCreate(data)
    toast.success(`Role "${data.name}" created`)
  }

  const handleSave = (id: string, data: Pick<Role, 'name' | 'description'>) => {
    onUpdate(id, data)
    toast.success('Role updated')
  }

  const handleDelete = (role: Role) => {
    onDelete(role)
    toast.error(`Role "${role.name}" deleted`)
  }

  const systemRoles = roles.filter((r) => r.isSystem)
  const customRoles  = roles.filter((r) => !r.isSystem)

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
          {systemRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={setEditRole}
              onDelete={handleDelete}
            />
          ))}
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
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Role
          </Button>
        </div>

        {customRoles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={setEditRole}
                onDelete={handleDelete}
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
        onCreate={handleCreate}
      />
      <EditRoleDialog
        role={editRole}
        onClose={() => setEditRole(null)}
        onSave={handleSave}
      />
    </div>
  )
}
