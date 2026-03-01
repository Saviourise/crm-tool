export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)           score++
  if (password.length >= 12)          score++
  if (/[A-Z]/.test(password))         score++
  if (/[0-9]/.test(password))         score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Weak',        color: 'bg-rose-500' }
  if (score === 2) return { score, label: 'Fair',        color: 'bg-amber-500' }
  if (score === 3) return { score, label: 'Good',        color: 'bg-yellow-400' }
  if (score === 4) return { score, label: 'Strong',      color: 'bg-emerald-400' }
  return              { score, label: 'Very Strong',  color: 'bg-emerald-500' }
}

export function getUsagePercent(used: number, limit: number): number {
  return Math.min(Math.round((used / limit) * 100), 100)
}

export function getUsageColor(pct: number): string {
  if (pct >= 90) return 'bg-rose-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-primary'
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}
