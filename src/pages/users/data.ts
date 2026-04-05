import type { AppUser, Role, PermissionMatrix } from './typings'

// ─── Roles ────────────────────────────────────────────────────────────────────

export const MOCK_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features, settings, users, and billing. Can manage roles and permissions.',
    isSystem: true,
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    borderColor: 'border-l-rose-500',
    userCount: 1,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'View and edit all pipelines, assign leads, generate reports, and oversee team activity.',
    isSystem: true,
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    borderColor: 'border-l-amber-500',
    userCount: 1,
  },
  {
    id: 'sales-rep',
    name: 'Sales Rep',
    description: 'Manage own pipeline, update contacts and lead activity, log communications and tasks.',
    isSystem: true,
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    borderColor: 'border-l-blue-500',
    userCount: 3,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Access campaign tools, templates, AI hub, segmentation, and performance dashboards.',
    isSystem: true,
    color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800',
    borderColor: 'border-l-violet-500',
    userCount: 2,
  },
  {
    id: 'support',
    name: 'Support Agent',
    description: 'View and respond to customer communications, update contact status, manage support tasks.',
    isSystem: true,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800',
    borderColor: 'border-l-cyan-500',
    userCount: 1,
  },
]

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: AppUser[] = [
  { id: 'u1', name: 'Alex Rivera',  initials: 'AR', avatarColor: 'bg-blue-500',    email: 'alex@company.com',     roleId: 'admin',     status: 'active',      lastLogin: '2 min ago',    joinedAt: 'Jan 1, 2025' },
  { id: 'u2', name: 'Emma Torres',  initials: 'ET', avatarColor: 'bg-rose-500',    email: 'emma@company.com',     roleId: 'manager',   status: 'active',      lastLogin: '1 hour ago',   joinedAt: 'Feb 14, 2025' },
  { id: 'u3', name: 'Sarah Kim',    initials: 'SK', avatarColor: 'bg-violet-500',  email: 'sarah@company.com',    roleId: 'sales-rep', status: 'active',      lastLogin: '9:32 AM',      joinedAt: 'Mar 3, 2025' },
  { id: 'u4', name: 'James Obi',    initials: 'JO', avatarColor: 'bg-emerald-500', email: 'james@company.com',    roleId: 'sales-rep', status: 'active',      lastLogin: 'Yesterday',    joinedAt: 'Mar 15, 2025' },
  { id: 'u5', name: 'David Park',   initials: 'DP', avatarColor: 'bg-amber-500',   email: 'david@company.com',    roleId: 'marketing', status: 'active',      lastLogin: '3 hours ago',  joinedAt: 'Apr 1, 2025' },
  { id: 'u6', name: 'Lisa Chen',    initials: 'LC', avatarColor: 'bg-cyan-500',    email: 'lisa@company.com',     roleId: 'support',   status: 'active',      lastLogin: '11:15 AM',     joinedAt: 'Apr 20, 2025' },
  { id: 'u7', name: 'Mike Foster',  initials: 'MF', avatarColor: 'bg-orange-500',  email: 'mike@company.com',     roleId: 'sales-rep', status: 'invited',     lastLogin: undefined,      joinedAt: 'Feb 25, 2026' },
  { id: 'u8', name: 'Priya Kapoor', initials: 'PK', avatarColor: 'bg-pink-500',    email: 'priya.k@company.com',  roleId: 'marketing', status: 'invited',     lastLogin: undefined,      joinedAt: 'Feb 26, 2026' },
]

// ─── Permission Matrix ────────────────────────────────────────────────────────
// Fallback used only while the roles API is loading. After load, the live matrix
// is built from API data via buildPermissionMatrix(). Role IDs match MOCK_ROLES.

export const PERMISSIONS: PermissionMatrix = {
  users:         { 'super-admin': ['view','invite','edit','delete'], admin: ['view','invite','edit'], manager: ['view'], 'sales-rep': [], marketing: [], viewer: [] },
  contacts:      { 'super-admin': ['view','create','edit','delete','import','export'], admin: ['view','create','edit','delete','import','export'], manager: ['view','create','edit','delete','import','export'], 'sales-rep': ['view','create','edit','import'], marketing: ['view','import','export'], viewer: ['view'] },
  companies:     { 'super-admin': ['view','create','edit','delete'], admin: ['view','create','edit','delete'], manager: ['view','create','edit'], 'sales-rep': ['view','create'], marketing: ['view'], viewer: ['view'] },
  leads:         { 'super-admin': ['view','create','edit','delete','assign','import','export'], admin: ['view','create','edit','delete','assign','import','export'], manager: ['view','create','edit','assign'], 'sales-rep': ['view','create','edit'], marketing: ['view','create'], viewer: ['view'] },
  pipeline:      { 'super-admin': ['view','create','edit','delete'], admin: ['view','create','edit','delete'], manager: ['view','edit'], 'sales-rep': ['view'], marketing: ['view'], viewer: ['view'] },
  deals:         { 'super-admin': ['view','create','edit','delete'], admin: ['view','create','edit','delete'], manager: ['view','create','edit'], 'sales-rep': ['view','create','edit'], marketing: [], viewer: ['view'] },
  tasks:         { 'super-admin': ['view','create','edit','delete'], admin: ['view','create','edit','delete'], manager: ['view','create','edit','delete'], 'sales-rep': ['view','create','edit'], marketing: ['view','create','edit'], viewer: ['view'] },
  calendar:      { 'super-admin': ['view','create','edit','delete'], admin: ['view','create','edit','delete'], manager: ['view','create','edit'], 'sales-rep': ['view','create'], marketing: [], viewer: ['view'] },
  communication: { 'super-admin': ['view','send'], admin: ['view','send'], manager: ['view','send'], 'sales-rep': ['view','send'], marketing: ['view'], viewer: ['view'] },
  marketing:     { 'super-admin': ['view','create','edit','delete','send'], admin: ['view','create','edit','delete','send'], manager: ['view','create'], 'sales-rep': ['view'], marketing: ['view','create','edit','send'], viewer: ['view'] },
  reports:       { 'super-admin': ['view','export'], admin: ['view','export'], manager: ['view','export'], 'sales-rep': ['view'], marketing: ['view'], viewer: ['view'] },
  settings:      { 'super-admin': ['view','edit','billing'], admin: ['view','edit'], manager: ['view'], 'sales-rep': [], marketing: [], viewer: [] },
  ai:            { 'super-admin': ['use'], admin: ['use'], manager: ['use'], 'sales-rep': ['use'], marketing: ['use'], viewer: [] },
}
