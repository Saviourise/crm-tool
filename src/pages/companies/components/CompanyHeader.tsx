import { useState } from 'react'
import { Upload, Download, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AddCompanyDialog } from '@/components/common/AddCompanyDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'
import { useAuth } from '@/auth/context'
import { companiesApi } from '@/api/companies'

interface CompanyHeaderProps {
  total: number
  isLoading?: boolean
  onCompanyListReload?: () => void | Promise<void>
}

export function CompanyHeader({ total, isLoading, onCompanyListReload }: CompanyHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { can, hasPlan } = useAuth()

  async function handleExport() {
    try {
      setExporting(true)
      const { data } = await companiesApi.export()
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `companies-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Companies exported', { description: 'Your companies have been exported as CSV.' })
    } catch {
      toast.error('Export failed', { description: 'Failed to export companies.' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Companies</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? 'Loading…' : `${total} ${total === 1 ? 'company' : 'companies'} in your CRM`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {can('companies.create') && hasPlan('csv-import') && (
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {can('companies.view') && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {exporting ? 'Exporting…' : 'Export'}
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
