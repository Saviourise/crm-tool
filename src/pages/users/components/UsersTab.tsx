import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal, UserPlus, ShieldOff, RotateCcw, Trash2, Edit2, SendHorizontal, Loader2,
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
import { usersApi } from '@/api/users'
import { WORKSPACE_USERS_QUERY_KEY } from '@/hooks/useWorkspaceUsers'
import { mapApiMemberToUser } from '../apiMappers'
import { getRoleBadgeClass, getRoleName, getStatusConfig } from '../utils'
import type { AppUser, Role, UserStatus } from '../typings'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/context'

const USERS_QUERY_KEY = ['users', 'list'] as const

// ─── Invite Dialog ─────────────────────────────────────────────────────────────

function InviteUserDialog({
  open,
  onClose,
  onInvite,
  roles,
  isLoadingRoles,
  isInviting,
}: {
  open: boolean
  onClose: () => void
  onInvite: (email: string, roleId: string) => void
  roles: Role[]
  isLoadingRoles: boolean
  isInviting: boolean
}) {
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')

  const handleClose = () => {
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
            <Select value={roleId} onValueChange={setRoleId} disabled={isLoadingRoles}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder={isLoadingRoles ? 'Loading roles...' : 'Select a role'} />
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
          <Button variant="outline" onClick={handleClose} disabled={isInviting}>Cancel</Button>
          <Button
            onClick={() => {
              if (!email.trim() || !roleId) return
              onInvite(email.trim(), roleId)
            }}
            disabled={!email.trim() || !roleId || isInviting}
          >
            {isInviting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><SendHorizontal className="h-4 w-4 mr-1.5" />Send Invite</>
            }
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
  isLoadingRoles,
  isSaving,
}: {
  user: AppUser | null
  onClose: () => void
  onSave: (id: string, roleId: string) => void
  roles: Role[]
  isLoadingRoles: boolean
  isSaving: boolean
}) {
  const [roleId, setRoleId] = useState('')

  useEffect(() => {
    if (user) setRoleId(user.roleId)
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
            <Select value={roleId} onValueChange={setRoleId} disabled={isLoadingRoles}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            disabled={!roleId || isSaving}
            onClick={() => onSave(user.id, roleId)}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
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
  busyId: string | null,
  canEditUser: boolean,
  canInvite: boolean,
  canDeleteUser: boolean,
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
        <Badge variant="outline" className={cn('text-xs capitalize', getRoleBadgeClass(row.original.roleId, roles))}>
          {getRoleName(row.original.roleId, roles).replace(/-/g, ' ')}
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
        const isBusy = busyId === u.id
        const hasAnyAction = canEditUser || canInvite || canDeleteUser
        if (!hasAnyAction) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
                {isBusy
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <MoreHorizontal className="h-4 w-4" />
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEditUser && (
                <DropdownMenuItem onClick={() => onEdit(u)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit User
                </DropdownMenuItem>
              )}
              {canInvite && u.status === 'invited' && (
                <DropdownMenuItem onClick={() => onAction(u, 'resend')}>
                  <SendHorizontal className="h-3.5 w-3.5 mr-2" />
                  Resend Invite
                </DropdownMenuItem>
              )}
              {canEditUser && u.status === 'active' && (
                <DropdownMenuItem onClick={() => onAction(u, 'deactivate')}>
                  <ShieldOff className="h-3.5 w-3.5 mr-2" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {canEditUser && u.status === 'deactivated' && (
                <DropdownMenuItem onClick={() => onAction(u, 'reactivate')}>
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Reactivate
                </DropdownMenuItem>
              )}
              {canDeleteUser && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onAction(u, 'remove')}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Remove User
                  </DropdownMenuItem>
                </>
              )}
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
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    invited: users.filter((u) => u.status === 'invited').length,
    deactivated: users.filter((u) => u.status === 'deactivated').length,
  }
  const stats = [
    { label: 'Total Users', value: counts.total, border: 'border-l-blue-500' },
    { label: 'Active', value: counts.active, border: 'border-l-emerald-500' },
    { label: 'Invited', value: counts.invited, border: 'border-l-amber-500' },
    { label: 'Deactivated', value: counts.deactivated, border: 'border-l-slate-400' },
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

export function UsersTab({
  roles,
  isLoadingRoles,
}: {
  roles: Role[]
  isLoadingRoles: boolean
}) {
  const queryClient = useQueryClient()
  const { can } = useAuth()
  const canInvite = can('users.invite')
  const canEditUser = can('users.edit')
  const canDeleteUser = can('users.delete')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // ─── Query ──────────────────────────────────────────────────────────────────

  const { data: membersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => usersApi.list(),
  })

  const users: AppUser[] = (membersData?.data ?? []).map(mapApiMemberToUser)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: WORKSPACE_USERS_QUERY_KEY })
  }

  // ─── Invite ─────────────────────────────────────────────────────────────────

  const { mutate: inviteMutation, isPending: isInviting } = useMutation({
    mutationFn: ({ email, roleId }: { email: string; roleId: string }) =>
      usersApi.invite({ email, role_id: roleId }),
    onSuccess: (_, { email }) => {
      toast.success(`Invite sent to ${email}`)
      setInviteOpen(false)
      invalidate()
    },
    onError: () => toast.error('Failed to send invite'),
  })

  // ─── Update role ─────────────────────────────────────────────────────────────

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      usersApi.update(id, { role_id: roleId }),
    onSuccess: () => {
      toast.success('User updated')
      setEditUser(null)
      invalidate()
    },
    onError: () => toast.error('Failed to update user'),
  })

  // ─── Per-row actions ─────────────────────────────────────────────────────────

  const { mutate: statusMutation } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersApi.update(id, { status }),
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: (_, { status }) => {
      toast.success(status === 'deactivated' ? 'User deactivated' : 'User reactivated')
      invalidate()
    },
    onError: () => toast.error('Failed to update user status'),
    onSettled: () => setBusyId(null),
  })

  const { mutate: removeMutation } = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onMutate: (id) => setBusyId(id),
    onSuccess: () => {
      toast.success('User removed')
      setSelectedIds((prev) => prev.filter((x) => x !== busyId))
      invalidate()
    },
    onError: () => toast.error('Failed to remove user'),
    onSettled: () => setBusyId(null),
  })

  const { mutate: resendMutation } = useMutation({
    mutationFn: (id: string) => usersApi.resendInvite(id),
    onMutate: (id) => setBusyId(id),
    onSuccess: (_, id) => {
      const user = users.find((u) => u.id === id)
      toast.success(`Invite resent to ${user?.email ?? 'user'}`)
    },
    onError: () => toast.error('Failed to resend invite'),
    onSettled: () => setBusyId(null),
  })

  const handleAction = (
    user: AppUser,
    action: 'deactivate' | 'reactivate' | 'resend' | 'remove',
  ) => {
    if (action === 'deactivate') { statusMutation({ id: user.id, status: 'deactivated' }); return }
    if (action === 'reactivate') { statusMutation({ id: user.id, status: 'active' }); return }
    if (action === 'remove') { removeMutation(user.id); return }
    if (action === 'resend') { resendMutation(user.id) }
  }

  // ─── Bulk actions ────────────────────────────────────────────────────────────

  const [isBulkBusy, setIsBulkBusy] = useState(false)

  const handleBulkDeactivate = async () => {
    setIsBulkBusy(true)
    await Promise.allSettled(
      selectedIds.map((id) => usersApi.update(id, { status: 'deactivated' }))
    )
    toast.success(`${selectedIds.length} user${selectedIds.length !== 1 ? 's' : ''} deactivated`)
    setSelectedIds([])
    setIsBulkBusy(false)
    invalidate()
  }

  const handleBulkRemove = async () => {
    setIsBulkBusy(true)
    await Promise.allSettled(selectedIds.map((id) => usersApi.remove(id)))
    toast.success(`${selectedIds.length} user${selectedIds.length !== 1 ? 's' : ''} removed`)
    setSelectedIds([])
    setIsBulkBusy(false)
    invalidate()
  }

  // ─── Table ────────────────────────────────────────────────────────────────────

  const handleToggle = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const handleToggleAll = () =>
    setSelectedIds((prev) => prev.length === users.length ? [] : users.map((u) => u.id))

  const columns = useMemo(
    () => buildColumns(
      users, roles, selectedIds,
      handleToggle, handleToggleAll,
      setEditUser, handleAction,
      busyId, canEditUser, canInvite, canDeleteUser,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, roles, selectedIds, busyId, canEditUser, canInvite, canDeleteUser],
  )

  return (
    <div className="space-y-4">
      <UserStats users={users} />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoadingUsers}
        searchPlaceholder="Search users..."
        toolbar={() => (
          canInvite ? (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite User
            </Button>
          ) : null
        )}
        emptyMessage="No users found"
        emptyDescription="Invite team members to get started"
      />

      {selectedIds.length > 0 && (canEditUser || canDeleteUser) && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg flex-wrap justify-center sm:flex-nowrap sm:justify-start max-w-max mx-auto">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="w-px h-4 bg-primary-foreground/30" />
          {canEditUser && (
            <Button
              size="sm"
              className="h-7 text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0 shadow-none"
              disabled={isBulkBusy}
              onClick={handleBulkDeactivate}
            >
              {isBulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5 mr-1" />}
              Deactivate
            </Button>
          )}
          {canDeleteUser && (
            <Button
              size="sm"
              className="h-7 text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0 shadow-none"
              disabled={isBulkBusy}
              onClick={handleBulkRemove}
            >
              {isBulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Remove
            </Button>
          )}
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
        onInvite={(email, roleId) => inviteMutation({ email, roleId })}
        roles={roles}
        isLoadingRoles={isLoadingRoles}
        isInviting={isInviting}
      />

      <EditUserDialog
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={(id, roleId) => updateMutation({ id, roleId })}
        roles={roles}
        isLoadingRoles={isLoadingRoles}
        isSaving={isUpdating}
      />
    </div>
  )
}
