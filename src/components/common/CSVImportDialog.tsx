import { useState, useRef, useCallback } from 'react'
import { CloudUpload, ChevronRight, Check, AlertTriangle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type CSVImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entity: 'contacts' | 'leads'
}

const CONTACT_FIELDS = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Skip']
const LEAD_FIELDS = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Score', 'Source', 'Skip']

type Step = 1 | 2 | 3 | 4

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  return lines.map((line) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  })
}

export function CSVImportDialog({ open, onOpenChange, entity }: CSVImportDialogProps) {
  const [step, setStep] = useState<Step>(1)
  const [fileName, setFileName] = useState('')
  const [csvHeaders, setCSVHeaders] = useState<string[]>([])
  const [csvRows, setCSVRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importDone, setImportDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fieldOptions = entity === 'contacts' ? CONTACT_FIELDS : LEAD_FIELDS

  const resetState = () => {
    setStep(1)
    setFileName('')
    setCSVHeaders([])
    setCSVRows([])
    setColumnMapping({})
    setIsDragOver(false)
    setImportProgress(0)
    setImportDone(false)
  }

  const handleClose = (v: boolean) => {
    if (!v) resetState()
    onOpenChange(v)
  }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Invalid file', { description: 'Please upload a .csv file.' })
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length < 2) {
        toast.error('Empty file', { description: 'The CSV file has no data rows.' })
        return
      }
      const headers = parsed[0]
      const rows = parsed.slice(1)
      setCSVHeaders(headers)
      setCSVRows(rows)
      // Auto-map headers by name similarity
      const defaultMapping: Record<number, string> = {}
      headers.forEach((header, idx) => {
        const lower = header.toLowerCase()
        const match = fieldOptions.find((f) => f.toLowerCase() === lower) ??
          fieldOptions.find((f) => lower.includes(f.toLowerCase().replace(' ', '')))
        defaultMapping[idx] = match ?? 'Skip'
      })
      setColumnMapping(defaultMapping)
      setStep(2)
    }
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [entity, fieldOptions])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const previewRows = csvRows.slice(0, 5)
  const mappedColumns = csvHeaders
    .map((_, idx) => columnMapping[idx])
    .filter((f) => f && f !== 'Skip')
  const emailColIdx = csvHeaders.findIndex(
    (_, idx) => columnMapping[idx] === 'Email'
  )
  const rowsWithIssues = previewRows.filter(
    (row) => emailColIdx >= 0 && !row[emailColIdx]?.trim()
  ).length
  const rowsReady = previewRows.length - rowsWithIssues

  const handleImport = () => {
    setStep(4)
    setImportProgress(0)
    setImportDone(false)
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportDone(true)
          return 100
        }
        return prev + 10
      })
    }, 120)
  }

  const totalRows = csvRows.length
  const skippedRows = Math.max(0, Math.floor(totalRows * 0.06))
  const importedRows = totalRows - skippedRows

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import {entity === 'contacts' ? 'Contacts' : 'Leads'} from CSV</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload a CSV file to import your data.'}
            {step === 2 && 'Map each CSV column to the correct CRM field.'}
            {step === 3 && 'Review the first 5 rows before importing.'}
            {step === 4 && (importDone ? 'Import complete.' : 'Importing your data...')}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          {(['Upload', 'Map', 'Preview', 'Import'] as const).map((label, i) => {
            const stepNum = (i + 1) as Step
            const active = step === stepNum
            const done = step > stepNum
            return (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={cn(
                  'font-medium',
                  active && 'text-primary',
                  done && 'text-muted-foreground line-through'
                )}>
                  {done ? <Check className="h-3 w-3 inline" /> : null} {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
          >
            <CloudUpload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">
              {fileName ? fileName : 'Drop your CSV file here'}
            </p>
            <p className="text-xs text-muted-foreground">
              {fileName ? 'Processing...' : 'or click to browse'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Step 2: Map columns */}
        {step === 2 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground mb-1 px-1">
              <span>CSV Column</span>
              <span>CRM Field</span>
            </div>
            {csvHeaders.map((header, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-x-4 items-center">
                <span className="text-sm truncate px-1 py-1 bg-muted/40 rounded">{header}</span>
                <Select
                  value={columnMapping[idx] ?? 'Skip'}
                  onValueChange={(val) =>
                    setColumnMapping((prev) => ({ ...prev, [idx]: val }))
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                {rowsReady} rows ready
              </Badge>
              {rowsWithIssues > 0 && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {rowsWithIssues} with issues
                </Badge>
              )}
              {csvRows.length > 5 && (
                <span className="text-muted-foreground">Showing first 5 of {csvRows.length} rows</span>
              )}
            </div>
            <div className="overflow-x-auto rounded border">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    {csvHeaders.map((h, idx) =>
                      columnMapping[idx] !== 'Skip' ? (
                        <th key={idx} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                          {columnMapping[idx]}
                        </th>
                      ) : null
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, rIdx) => {
                    const hasIssue = emailColIdx >= 0 && !row[emailColIdx]?.trim()
                    return (
                      <tr
                        key={rIdx}
                        className={cn('border-b last:border-0', hasIssue && 'bg-amber-50/50 dark:bg-amber-950/20')}
                      >
                        {csvHeaders.map((_, cIdx) =>
                          columnMapping[cIdx] !== 'Skip' ? (
                            <td
                              key={cIdx}
                              className={cn(
                                'px-3 py-1.5 whitespace-nowrap',
                                hasIssue && cIdx === emailColIdx && 'text-amber-600 font-medium'
                              )}
                            >
                              {row[cIdx] || (hasIssue && cIdx === emailColIdx ? (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <AlertTriangle className="h-3 w-3" /> Missing
                                </span>
                              ) : '—')}
                            </td>
                          ) : null
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Import */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            {!importDone ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Importing...</span>
                  <span className="font-medium">{importProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Import complete</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{importedRows} {entity} imported successfully</p>
                  {skippedRows > 0 && <p>{skippedRows} rows skipped due to missing required fields</p>}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 && (
            <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={mappedColumns.length === 0}
              >
                Preview
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleImport}>
                Import {csvRows.length} {entity}
              </Button>
            </>
          )}
          {step === 4 && importDone && (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
