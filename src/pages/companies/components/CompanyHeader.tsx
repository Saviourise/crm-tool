import { Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/context'

interface CompanyHeaderProps {
  total: number
  onAdd: () => void
  onImport: () => void
}

export function CompanyHeader({ total, onAdd, onImport }: CompanyHeaderProps) {
  const { can, hasPlan } = useAuth()

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground mt-1">
          {total} {total === 1 ? 'company' : 'companies'} in your CRM
        </p>
      </div>
      <div className="flex items-center gap-2">
        {can('companies.create') && hasPlan('csv-import') && (
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {can('companies.create') && (
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>
    </div>
  )
}
