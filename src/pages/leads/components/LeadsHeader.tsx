import { useState } from 'react'
import { Upload, Download, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateLeadDialog } from '@/components/common/CreateLeadDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'
import { useAuth } from '@/auth/context'

interface LeadsHeaderProps {
  total: number
  isLoading?: boolean
  onExport?: () => void | Promise<void>
  isExporting?: boolean
  onLeadListReload?: () => void | Promise<void>
}

export function LeadsHeader({ total, isLoading, onExport, isExporting = false, onLeadListReload }: LeadsHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)
  const { can, hasPlan } = useAuth()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Leads</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? 'Loading…' : `${total} lead${total !== 1 ? 's' : ''} in your pipeline`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {can('leads.import') && hasPlan('csv-import') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {can('leads.export') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { void onExport?.() }}
            disabled={isExporting || !onExport}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exporting…' : 'Export'}
          </Button>
        )}
        {can('leads.create') && (
          <CreateLeadDialog
            onListReload={onLeadListReload}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            }
          />
        )}
      </div>
      <CSVImportDialog open={importOpen} onOpenChange={setImportOpen} entity="leads" />
    </div>
  )
}
