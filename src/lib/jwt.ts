/**
 * Decode JWT payload without verification (client-side only, for reading claims like sub).
 * Do not use for security decisions — server validates the token.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padding = '==='.slice(0, (4 - (base64.length % 4)) % 4)
    const decoded = atob(base64 + padding)
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

export function getUserIdFromToken(accessToken: string): string | null {
  const payload = decodeJwtPayload<{ sub?: string }>(accessToken)
  return payload?.sub ?? null
}
