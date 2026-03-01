import { useState } from 'react'
import { Upload, Download, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AddContactDialog } from '@/components/common/AddContactDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'
import { useAuth } from '@/auth/context'

interface ContactsHeaderProps {
  total: number
}

export function ContactsHeader({ total }: ContactsHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)
  const { can, hasPlan } = useAuth()

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground mt-1">
          {total} contact{total !== 1 ? 's' : ''} in your CRM
        </p>
      </div>
      <div className="flex items-center gap-2">
        {can('contacts.import') && hasPlan('csv-import') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {can('contacts.export') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Contacts exported', { description: 'Your contacts have been exported as CSV.' })}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
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
