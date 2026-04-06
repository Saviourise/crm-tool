import { useState, useRef } from 'react'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { openChat } from '@/lib/chatStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TIMEZONES, LANGUAGES, AVATAR_COLORS } from '../data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/context'

// ─── Color Picker Popover ──────────────────────────────────────────────────────

function ColorPickerPopover({
  value,
  onChange,
}: {
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background hover:bg-muted transition-colors text-sm"
        >
          <span
            className="h-4 w-4 rounded-full border border-border shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="start">
        {/* Preset swatches */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Presets</p>
          <div className="flex gap-2 flex-wrap">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onChange(c.value)}
                style={{ backgroundColor: c.value }}
                className={cn(
                  'h-7 w-7 rounded-full transition-all border-2',
                  value === c.value
                    ? 'border-foreground scale-110'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                )}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>

        {/* Custom color input */}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Custom</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-md border border-input p-0.5 bg-background"
              />
            </div>
            <Input
              value={value}
              onChange={(e) => {
                const v = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
              }}
              onBlur={(e) => {
                // Pad short hex to full 6-digit on blur
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) return
                onChange(value) // revert if invalid
              }}
              className="font-mono text-xs h-9"
              maxLength={7}
              placeholder="#000000"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ProfileSection() {
  const { user, updateProfile } = useAuth()

  // ─── Per-card form state ──────────────────────────────────────────────────────

  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? '#3b82f6')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const [name, setName]         = useState(user?.name ?? '')
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? '')
  const [phone, setPhone]       = useState(user?.phone ?? '')

  const [timezone, setTimezone] = useState(user?.timezone ?? 'America/New_York')
  const [language, setLanguage] = useState(user?.language ?? 'en')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Loading state per card ────────────────────────────────────────────────────

  const [saving, setSaving] = useState<'avatar' | 'info' | 'prefs' | null>(null)

  // ─── Helpers ───────────────────────────────────────────────────────────────────

  const save = async (section: 'avatar' | 'info' | 'prefs', payload: Parameters<typeof updateProfile>[0]) => {
    setSaving(section)
    try {
      await updateProfile(payload)
      toast.success('Changes saved')
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(null)
    }
  }

  // ─── Photo handlers ────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB.')
      return
    }
    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
    toast.success('Photo preview ready — note: photo upload requires a server endpoint (see docs/profile_settings_remaining_api.md).')
  }

  const handleRemovePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ─── Derived display ────────────────────────────────────────────────────────────

  const displayInitials = user?.initials ?? ((user?.name ?? '').split(/\s+/).map((p) => p[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || '?')

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* ── Profile Photo ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Upload a photo or choose a colored avatar with your initials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-2 ring-border"
                  style={{ backgroundColor: avatarColor }}
                >
                  {displayInitials}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {photoUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-600"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP. Max 5 MB. Square images work best.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Initials avatar color — shown when no photo */}
          {!photoUrl && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Initials Avatar
              </p>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <ColorPickerPopover value={avatarColor} onChange={setAvatarColor} />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button
            size="sm"
            disabled={saving === 'avatar'}
            onClick={() => save('avatar', { avatarColor })}
          >
            {saving === 'avatar' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* ── Personal Information ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving === 'info'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={saving === 'info'}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email — read-only */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="pr-20 bg-muted/50 text-muted-foreground cursor-not-allowed select-none"
                />
                {user.isVerified && (
                  <span className="absolute right-2.5 top-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact{' '}
                <button
                  type="button"
                  className="underline hover:text-foreground transition-colors"
                  onClick={openChat}
                >
                  support
                </button>
                {' '}if you need to update it.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving === 'info'}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button
            size="sm"
            disabled={saving === 'info' || !name.trim()}
            onClick={() => save('info', { name: name.trim(), jobTitle: jobTitle.trim(), phone: phone.trim() })}
          >
            {saving === 'info' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* ── Regional Preferences ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Preferences</CardTitle>
          <CardDescription>Set your language and timezone for date and time formatting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage} disabled={saving === 'prefs'}>
                <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone} disabled={saving === 'prefs'}>
                <SelectTrigger id="timezone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button
            size="sm"
            disabled={saving === 'prefs'}
            onClick={() => save('prefs', { timezone, language })}
          >
            {saving === 'prefs' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* ── Danger Zone ──────────────────────────────────────────────────────────── */}
      <Card className="border-rose-200 dark:border-rose-900">
        <CardHeader>
          <CardTitle className="text-rose-600 dark:text-rose-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30"
              onClick={() => toast.error('Account deletion is not yet available. Contact support to request account removal.')}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
