import { useState, useMemo, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal, UserPlus, ShieldOff, RotateCcw, Trash2, Edit2, SendHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { MOCK_USERS } from '../data'
import { getRoleBadgeClass, getRoleName, getStatusConfig } from '../utils'
import type { AppUser, Role, UserStatus } from '../typings'
import { cn } from '@/lib/utils'

// ─── Invite Dialog ─────────────────────────────────────────────────────────────

function InviteUserDialog({
  open,
  onClose,
  onInvite,
  roles,
}: {
  open: boolean
  onClose: () => void
  onInvite: (name: string, email: string, roleId: string) => void
  roles: Role[]
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')

  const handleClose = () => {
    setName('')
    setEmail('')
    setRoleId('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              placeholder="e.g. Jordan Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="jordan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!name.trim() || !email.trim() || !roleId) return
              onInvite(name.trim(), email.trim(), roleId)
              handleClose()
            }}
            disabled={!name.trim() || !email.trim() || !roleId}
          >
            <SendHorizontal className="h-4 w-4 mr-1.5" />
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Dialog ───────────────────────────────────────────────────────────────

function EditUserDialog({
  user,
  onClose,
  onSave,
  roles,
}: {
  user: AppUser | null
  onClose: () => void
  onSave: (id: string, roleId: string, status: UserStatus) => void
  roles: Role[]
}) {
  const [roleId, setRoleId] = useState('')
  const [status, setStatus] = useState<UserStatus>('active')

  useEffect(() => {
    if (user) {
      setRoleId(user.roleId)
      setStatus(user.status)
    }
  }, [user?.id])

  if (!user) return null

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0',
              user.avatarColor
            )}>
              {user.initials}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(user.id, roleId, status); onClose() }}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Column factory ────────────────────────────────────────────────────────────

function buildColumns(
  users: AppUser[],
  roles: Role[],
  selectedIds: string[],
  onToggle: (id: string) => void,
  onToggleAll: () => void,
  onEdit: (user: AppUser) => void,
  onAction: (user: AppUser, action: 'deactivate' | 'reactivate' | 'resend' | 'remove') => void,
): ColumnDef<AppUser>[] {
  const allSelected = users.length > 0 && selectedIds.length === users.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length

  return [
    {
      id: 'select',
      size: 40,
      enableSorting: false,
      header: () => (
        <Checkbox
          checked={allSelected || (someSelected ? 'indeterminate' : false)}
          onCheckedChange={onToggleAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={() => onToggle(row.original.id)}
          aria-label={`Select ${row.original.name}`}
        />
      ),
    },
    {
      id: 'user',
      accessorFn: (row) => row.name,
      header: 'User',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0',
              u.avatarColor
            )}>
              {u.initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'role',
      accessorFn: (row) => getRoleName(row.roleId, roles),
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('text-xs', getRoleBadgeClass(row.original.roleId, roles))}>
          {getRoleName(row.original.roleId, roles)}
        </Badge>
      ),
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: 'Status',
      cell: ({ row }) => {
        const cfg = getStatusConfig(row.original.status)
        return (
          <div className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
            <Badge variant="outline" className={cn('text-xs', cfg.className)}>
              {cfg.label}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'lastLogin',
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLogin ?? '—'}
        </span>
      ),
    },
    {
      id: 'joinedAt',
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.joinedAt}</span>
      ),
    },
    {
      id: 'actions',
      size: 56,
      enableSorting: false,
      header: '',
      cell: ({ row }) => {
        const u = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(u)}>
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Edit User
              </DropdownMenuItem>
              {u.status === 'invited' && (
                <DropdownMenuItem onClick={() => onAction(u, 'resend')}>
                  <SendHorizontal className="h-3.5 w-3.5 mr-2" />
                  Resend Invite
                </DropdownMenuItem>
              )}
              {u.status === 'active' && (
                <DropdownMenuItem onClick={() => onAction(u, 'deactivate')}>
                  <ShieldOff className="h-3.5 w-3.5 mr-2" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {u.status === 'deactivated' && (
                <DropdownMenuItem onClick={() => onAction(u, 'reactivate')}>
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onAction(u, 'remove')}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Remove User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

function UserStats({ users }: { users: AppUser[] }) {
  const counts = {
    total:       users.length,
    active:      users.filter((u) => u.status === 'active').length,
    invited:     users.filter((u) => u.status === 'invited').length,
    deactivated: users.filter((u) => u.status === 'deactivated').length,
  }

  const stats = [
    { label: 'Total Users',  value: counts.total,       border: 'border-l-blue-500' },
    { label: 'Active',       value: counts.active,      border: 'border-l-emerald-500' },
    { label: 'Invited',      value: counts.invited,     border: 'border-l-amber-500' },
    { label: 'Deactivated',  value: counts.deactivated, border: 'border-l-slate-400' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className={cn('border-l-4', s.border)}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
]

export function UsersTab({ roles }: { roles: Role[] }) {
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleToggleAll = () => {
    setSelectedIds((prev) => prev.length === users.length ? [] : users.map((u) => u.id))
  }

  const handleInvite = (name: string, email: string, roleId: string) => {
    const initials = name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    const newUser: AppUser = {
      id: `u${Date.now()}`,
      name,
      initials,
      avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
      email,
      roleId,
      status: 'invited',
      lastLogin: undefined,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setUsers((prev) => [...prev, newUser])
    toast.success(`Invite sent to ${email}`)
  }

  const handleSave = (id: string, roleId: string, status: UserStatus) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, roleId, status } : u))
    toast.success('User updated')
  }

  const handleAction = (
    user: AppUser,
    action: 'deactivate' | 'reactivate' | 'resend' | 'remove',
  ) => {
    if (action === 'remove') {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setSelectedIds((prev) => prev.filter((id) => id !== user.id))
      toast.error(`${user.name} removed`)
      return
    }
    if (action === 'deactivate') {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'deactivated' } : u))
      toast.success(`${user.name} deactivated`)
      return
    }
    if (action === 'reactivate') {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'active' } : u))
      toast.success(`${user.name} reactivated`)
      return
    }
    if (action === 'resend') {
      toast.success(`Invite resent to ${user.email}`)
    }
  }

  const handleBulkDeactivate = () => {
    setUsers((prev) =>
      prev.map((u) => selectedIds.includes(u.id) ? { ...u, status: 'deactivated' as UserStatus } : u)
    )
    toast.success(`${selectedIds.length} user${selectedIds.length !== 1 ? 's' : ''} deactivated`)
    setSelectedIds([])
  }

  const handleBulkRemove = () => {
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)))
    toast.error(`${selectedIds.length} user${selectedIds.length !== 1 ? 's' : ''} removed`)
    setSelectedIds([])
  }

  const columns = useMemo(
    () => buildColumns(users, roles, selectedIds, handleToggle, handleToggleAll, setEditUser, handleAction),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, roles, selectedIds],
  )

  return (
    <div className="space-y-4">
      <UserStats users={users} />

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users..."
        toolbar={() => (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite User
          </Button>
        )}
        emptyMessage="No users found"
        emptyDescription="Invite team members to get started"
      />

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="w-px h-4 bg-primary-foreground/30" />
          <Button
            size="sm"
            className="h-7 text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0 shadow-none"
            onClick={handleBulkDeactivate}
          >
            <ShieldOff className="h-3.5 w-3.5 mr-1" />
            Deactivate
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0 shadow-none"
            onClick={handleBulkRemove}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>
          <button
            className="text-xs text-primary-foreground/70 hover:text-primary-foreground underline"
            onClick={() => setSelectedIds([])}
          >
            Clear
          </button>
        </div>
      )}

      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        roles={roles}
      />

      <EditUserDialog
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSave}
        roles={roles}
      />
    </div>
  )
}
