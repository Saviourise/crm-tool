import { useState } from 'react'
import { Upload, Download, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'
import { useAuth } from '@/auth/context'
import { contactsApi } from '@/api/contacts'
import { useCsvExport } from '@/hooks/useCsvExport'

interface ContactsHeaderProps {
  total: number
  isLoading?: boolean
  onContactListReload?: () => void | Promise<void>
}

export function ContactsHeader({ total, isLoading, onContactListReload }: ContactsHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)
  const { can, hasPlan } = useAuth()
  const { exportCsv, isExporting } = useCsvExport({
    request: () => contactsApi.export(),
    filename: () => `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`,
    successTitle: 'Contacts exported',
    successDescription: 'Your contacts have been exported as CSV.',
    errorTitle: 'Export failed',
    errorDescription: 'Failed to export contacts.',
  })

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contacts</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? 'Loading…' : `${total} contact${total !== 1 ? 's' : ''} in your CRM`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {can('contacts.import') && hasPlan('csv-import') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {can('contacts.export') && (
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
        {can('contacts.create') && (
          <AddContactDialog
            onListReload={onContactListReload}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            }
          />
        )}
      </div>
      <CSVImportDialog open={importOpen} onOpenChange={setImportOpen} entity="contacts" />
    </div>
  )
}
