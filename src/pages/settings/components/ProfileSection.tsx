import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { openChat } from '@/lib/chatStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROFILE, TIMEZONES, LANGUAGES, AVATAR_COLORS } from '../data'
import type { ProfileData } from '../typings'
import { cn } from '@/lib/utils'

export function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData>(PROFILE)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof ProfileData) => (val: string) =>
    setProfile((p) => ({ ...p, [key]: val }))

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
    toast.success('Photo ready — click Save to apply.')
  }

  const handleRemovePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success('Photo removed')
  }

  const handleSave = () => {
    toast.success('Profile updated')
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Upload a photo or choose a colored avatar with your initials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-6">
            {/* Avatar preview */}
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className={cn(
                  'h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-2 ring-border',
                  profile.avatarColor
                )}>
                  {profile.initials}
                </div>
              )}
            </div>

            {/* Upload controls */}
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

          {/* Fallback avatar customization — shown when no photo uploaded */}
          {!photoUrl && (
            <div className="space-y-4 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Initials Avatar
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="space-y-1.5">
                  <Label htmlFor="initials">Initials</Label>
                  <Input
                    id="initials"
                    maxLength={2}
                    className="w-20 uppercase"
                    value={profile.initials}
                    onChange={(e) => set('initials')(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Color</Label>
                  <div className="flex gap-2 pt-0.5">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set('avatarColor')(c.value)}
                        className={cn(
                          'h-7 w-7 rounded-full transition-all',
                          c.value,
                          profile.avatarColor === c.value
                            ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                            : 'opacity-60 hover:opacity-100'
                        )}
                        aria-label={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Personal Info */}
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
                value={profile.name}
                onChange={(e) => set('name')(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={profile.jobTitle}
                onChange={(e) => set('jobTitle')(e.target.value)}
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
                  value={profile.email}
                  readOnly
                  className="pr-20 bg-muted/50 text-muted-foreground cursor-not-allowed select-none"
                />
                <span className="absolute right-2.5 top-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  Verified
                </span>
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
                value={profile.phone}
                onChange={(e) => set('phone')(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Preferences</CardTitle>
          <CardDescription>Set your language and timezone for date and time formatting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Select value={profile.language} onValueChange={set('language')}>
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
              <Select value={profile.timezone} onValueChange={set('timezone')}>
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
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Danger zone */}
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
              onClick={() => toast.error('Account deletion is disabled for demo accounts.')}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
