import { useState } from 'react'
import { Upload, Download, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CreateLeadDialog } from '@/components/common/CreateLeadDialog'
import { CSVImportDialog } from '@/components/common/CSVImportDialog'

interface LeadsHeaderProps {
  total: number
}

export function LeadsHeader({ total }: LeadsHeaderProps) {
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground mt-1">
          {total} lead{total !== 1 ? 's' : ''} in your pipeline
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Leads exported', { description: 'Your leads have been exported as CSV.' })}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <CreateLeadDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          }
        />
      </div>
      <CSVImportDialog open={importOpen} onOpenChange={setImportOpen} entity="leads" />
    </div>
  )
}
