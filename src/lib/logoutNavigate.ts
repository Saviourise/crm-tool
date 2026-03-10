/**
 * Navigate to login without full page refresh.
 * Uses dynamic import to avoid circular dependency with router.
 */
export function navigateToLogin(): void {
  import('@/router').then(({ router }) => {
    router.navigate('/login', { replace: true })
  })
}
