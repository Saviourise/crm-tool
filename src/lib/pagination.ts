export function parseNextCursor(next: string | null | undefined): string | null {
  if (!next) return null
  try {
    if (next.startsWith('http')) {
      const u = new URL(next)
      return u.searchParams.get('cursor') ?? next
    }
    return next
  } catch {
    return next
  }
}
