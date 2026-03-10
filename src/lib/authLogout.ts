import { useAuthStore } from '@/store/authStore'
import { STORAGE_KEYS } from '@/utils/constants'
import { navigateToLogin } from './logoutNavigate'

/**
 * Force logout: clear tokens, clear persisted user, redirect to login.
 * Called when refresh token fails or token is invalid.
 */
export function forceLogout(): void {
  useAuthStore.getState().clearTokens()
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  navigateToLogin()
}
