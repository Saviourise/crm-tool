import { useState } from 'react'
import { Upload, Download, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'
import { useAuth } from '@/auth/context'
import { contactsApi } from '@/api/contacts'

interface ContactsHeaderProps {
  total: number
  isLoading?: boolean
}

export function ContactsHeader({ total, isLoading }: ContactsHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { can, hasPlan } = useAuth()

  async function handleExport() {
    try {
      setExporting(true)
      const { data } = await contactsApi.export()
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Contacts exported', { description: 'Your contacts have been exported as CSV.' })
    } catch {
      toast.error('Export failed', { description: 'Failed to export contacts.' })
    } finally {
      setExporting(false)
    }
  }

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
        {can('contacts.create') && (
          <AddContactDialog
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
