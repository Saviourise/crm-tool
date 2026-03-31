import { useState } from 'react'
import { Upload, Download, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddCompanyDialog } from '@/components/common/AddCompanyDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'
import { useAuth } from '@/auth/context'
import { companiesApi } from '@/api/companies'
import { useCsvExport } from '@/hooks/useCsvExport'

interface CompanyHeaderProps {
  total: number
  isLoading?: boolean
  onCompanyListReload?: () => void | Promise<void>
}

export function CompanyHeader({ total, isLoading, onCompanyListReload }: CompanyHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)
  const { can, hasPlan } = useAuth()
  const { exportCsv, isExporting } = useCsvExport({
    request: () => companiesApi.export(),
    filename: () => `companies-export-${new Date().toISOString().slice(0, 10)}.csv`,
    successTitle: 'Companies exported',
    successDescription: 'Your companies have been exported as CSV.',
    errorTitle: 'Export failed',
    errorDescription: 'Failed to export companies.',
  })

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Companies</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? 'Loading…' : `${total} ${total === 1 ? 'company' : 'companies'} in your CRM`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {can('companies.import') && hasPlan('csv-import') && (
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {can('companies.export') && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exporting…' : 'Export'}
          </Button>
        )}
        {can('companies.create') && (
          <AddCompanyDialog
            onListReload={onCompanyListReload}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            }
          />
        )}
      </div>
      <CSVImportDialog open={importOpen} onOpenChange={setImportOpen} entity="companies" />
    </div>
  )
}
