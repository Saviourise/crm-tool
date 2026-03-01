import { useState, useRef } from 'react'
import { Building2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TEAM, TIMEZONES, DATE_FORMATS } from '../data'
import { MOCK_ROLES } from '@/pages/users/data'
import type { TeamData } from '../typings'

export function TeamSection() {
  const [team, setTeam] = useState<TeamData>(TEAM)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof TeamData) => (val: string) =>
    setTeam((t) => ({ ...t, [key]: val }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be smaller than 2 MB.')
      return
    }
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(URL.createObjectURL(file))
    toast.success('Logo updated — click Save to apply.')
  }

  const handleRemoveLogo = () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
    toast.success('Logo removed')
  }

  const handleSave = () => toast.success('Team settings saved')

  return (
    <div className="space-y-6">
      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Basic information about your company workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Logo preview */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Organization logo"
                className="h-14 w-14 rounded-xl object-cover ring-2 ring-border shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">{team.orgName}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {logoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-rose-500 hover:text-rose-600"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG or SVG. Max 2 MB.</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={team.orgName}
                onChange={(e) => set('orgName')(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourcompany.com"
                value={team.website}
                onChange={(e) => set('website')(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t justify-end">
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Defaults</CardTitle>
          <CardDescription>
            These settings apply to the whole team and affect how dates and times are displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="team-timezone">Team Timezone</Label>
              <Select value={team.timezone} onValueChange={set('timezone')}>
                <SelectTrigger id="team-timezone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used for scheduling, reports, and reminders.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={team.dateFormat} onValueChange={set('dateFormat')}>
                <SelectTrigger id="date-format"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="default-role">Default Role for New Invitations</Label>
            <Select value={team.defaultRole} onValueChange={set('defaultRole')}>
              <SelectTrigger id="default-role" className="w-full sm:w-72"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOCK_ROLES.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              New team members are assigned this role by default when invited.
            </p>
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
          <CardDescription>Actions that affect the entire workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Export All Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download a full export of all contacts, leads, deals, and activity logs.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => toast.success('Export started — you will receive an email when ready.')}
            >
              Export
            </Button>
          </div>
          <div className="border-t pt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete the workspace and all data. All team members will lose access immediately.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30"
              onClick={() => toast.error('Workspace deletion is disabled for demo accounts.')}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
