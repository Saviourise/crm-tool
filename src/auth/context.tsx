import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthUser, AuthState, RoleId, Permission, Feature, PlanId } from './types'
import { DEMO_USERS } from './demo-users'
import { hasPermission, hasFeature, planMeetsMinimum } from './permissions'

const AUTH_KEY = 'crm_auth_user'

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  can: (permission: Permission) => boolean
  hasPlan: (feature: Feature) => boolean
  planAtLeast: (plan: PlanId) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const demo = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!demo) {
          resolve({ success: false, error: 'Invalid email or password.' })
          return
        }
        const authUser: AuthUser = {
          id: demo.id,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          plan: demo.plan,
          company: demo.company,
          avatarColor: demo.avatarColor,
          initials: demo.initials,
          jobTitle: demo.jobTitle,
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
        setUser(authUser)
        resolve({ success: true })
      }, 700)
    })
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  function can(permission: Permission): boolean {
    if (!user) return false
    return hasPermission(user.role as RoleId, permission)
  }

  function hasPlan(feature: Feature): boolean {
    if (!user) return false
    return hasFeature(user.plan, feature)
  }

  function planAtLeast(plan: PlanId): boolean {
    if (!user) return false
    return planMeetsMinimum(user.plan, plan)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, can, hasPlan, planAtLeast }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
