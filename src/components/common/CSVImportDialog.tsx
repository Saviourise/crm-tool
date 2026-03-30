import { useState, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CloudUpload, ChevronRight, Check, AlertTriangle, Download } from 'lucide-react'
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
import { contactsApi } from '@/api/contacts'
import { companiesApi } from '@/api/companies'
import { leadsApi } from '@/api/leads'
import { dashboardQueryKeys } from '@/pages/dashboard/queryKeys'

export type CSVImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entity: 'contacts' | 'leads' | 'companies'
}

const CONTACT_FIELDS = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Skip']
const LEAD_FIELDS = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Score', 'Source', 'Skip']
const COMPANY_FIELDS = ['Name', 'Website', 'Industry', 'Status', 'Employees', 'Annual Revenue', 'Phone', 'Address', 'Skip']

const CONTACT_UI_TO_API: Record<string, string> = {
  'First Name': 'first_name',
  'Last Name': 'last_name',
  Email: 'email',
  Phone: 'phone',
  Company: 'company',
  Position: 'position',
  Status: 'status',
}

const LEAD_UI_TO_API: Record<string, string> = {
  'First Name': 'first_name',
  'Last Name': 'last_name',
  Email: 'email',
  Phone: 'phone',
  Company: 'company',
  Position: 'position',
  Status: 'status',
  Score: 'score',
  Source: 'source',
}

const COMPANY_UI_TO_API: Record<string, string> = {
  Name: 'name',
  Website: 'website',
  Industry: 'industry',
  Status: 'status',
  Employees: 'employees',
  'Annual Revenue': 'annual_revenue',
  Phone: 'phone',
  Address: 'address',
}

const UI_TO_API_FIELD: Record<string, Record<string, string>> = {
  contacts: CONTACT_UI_TO_API,
  leads: LEAD_UI_TO_API,
  companies: COMPANY_UI_TO_API,
}

const SAMPLE_TEMPLATES: Record<'contacts' | 'leads' | 'companies', { headers: string[]; row: string[] }> = {
  contacts: {
    headers: ['first_name', 'last_name', 'email', 'phone', 'company', 'position', 'status'],
    row: ['John', 'Doe', 'john.doe@example.com', '+1 555 000 1234', 'Acme Corp', 'Product Manager', 'active'],
  },
  leads: {
    headers: ['first_name', 'last_name', 'email', 'phone', 'company', 'position', 'status', 'score', 'source'],
    row: ['Jane', 'Smith', 'jane.smith@techcorp.com', '+1 555 000 5678', 'TechCorp', 'CTO', 'new', '75', 'website'],
  },
  companies: {
    headers: ['name', 'website', 'industry', 'status', 'employees', 'annual_revenue', 'phone', 'address'],
    row: ['Acme Corp', 'https://acme.com', 'Technology', 'active', '150', '5000000', '+1 555 000 9999', '123 Main St, San Francisco, CA'],
  },
}

function downloadTemplate(entity: 'contacts' | 'leads' | 'companies') {
  const { headers, row } = SAMPLE_TEMPLATES[entity]
  const escape = (v: string) => (v.includes(',') ? `"${v}"` : v)
  const csv = [headers.map(escape).join(','), row.map(escape).join(',')].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entity}_template.csv`
  a.click()
  URL.revokeObjectURL(url)
}

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
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>(1)
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [csvHeaders, setCSVHeaders] = useState<string[]>([])
  const [csvRows, setCSVRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importDone, setImportDone] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: { row: number; reason: string }[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fieldOptions =
    entity === 'contacts' ? CONTACT_FIELDS : entity === 'companies' ? COMPANY_FIELDS : LEAD_FIELDS

  const resetState = () => {
    setStep(1)
    setFileName('')
    setFile(null)
    setCSVHeaders([])
    setCSVRows([])
    setColumnMapping({})
    setIsDragOver(false)
    setImportProgress(0)
    setImportDone(false)
    setImportError(null)
    setImportResult(null)
  }

  const handleClose = (v: boolean) => {
    if (!v) resetState()
    onOpenChange(v)
  }

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Invalid file', { description: 'Please upload a .csv file.' })
      return
    }
    setFileName(selectedFile.name)
    setFile(selectedFile)
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
      // Auto-map headers by name similarity.
      // Handles both "First Name" (title-case) and "first_name" (snake_case) formats.
      const defaultMapping: Record<number, string> = {}
      headers.forEach((header, idx) => {
        const lower = header.toLowerCase()
        const spaced = lower.replace(/_/g, ' ')  // "first_name" → "first name"
        const match =
          fieldOptions.find((f) => f.toLowerCase() === lower) ??          // exact: "Email" → "Email"
          fieldOptions.find((f) => f.toLowerCase() === spaced) ??          // snake: "first_name" → "First Name"
          fieldOptions.find((f) => lower.includes(f.toLowerCase().replace(/\s+/g, '')))
        defaultMapping[idx] = match ?? 'Skip'
      })
      setColumnMapping(defaultMapping)
      setStep(2)
    }
    reader.readAsText(selectedFile)
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
  const requiredColIdx = csvHeaders.findIndex(
    (_, idx) => columnMapping[idx] === (entity === 'companies' ? 'Name' : 'Email')
  )
  const rowsWithIssues = previewRows.filter(
    (row) => requiredColIdx >= 0 && !row[requiredColIdx]?.trim()
  ).length
  const rowsReady = previewRows.length - rowsWithIssues

  const buildColumnMap = (): Record<string, string> => {
    const map: Record<string, string> = {}
    const uiToApi = UI_TO_API_FIELD[entity] ?? CONTACT_UI_TO_API
    csvHeaders.forEach((_, idx) => {
      const uiField = columnMapping[idx]
      if (uiField && uiField !== 'Skip') {
        const apiField = uiToApi[uiField]
        if (apiField) map[String(idx)] = apiField
      }
    })
    return map
  }

  const pollImportStatus = async (taskId: string, entityType: 'contacts' | 'companies' | 'leads'): Promise<void> => {
    const apiModule = entityType === 'contacts' ? contactsApi : entityType === 'companies' ? companiesApi : leadsApi
    const entityLabel = entityType
    const poll = async (): Promise<void> => {
      const { data } = await apiModule.importStatus(taskId)
      if (data.status === 'SUCCESS') {
        setImportResult({
          imported: data.result?.imported ?? 0,
          skipped: data.result?.skipped ?? 0,
          errors: data.result?.errors ?? [],
        })
        setImportProgress(100)
        setImportDone(true)
        queryClient.invalidateQueries({ queryKey: [entityType] })
        queryClient.invalidateQueries({ queryKey: [entityType, 'stats'] })
        if (entityType === 'contacts') {
          queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.contactsCount })
        }
        toast.success('Import complete', {
          description: `${data.result?.imported ?? 0} ${entityLabel} imported successfully.`,
        })
        return
      }
      if (data.status === 'FAILURE') {
        setImportError(data.error ?? 'Import failed')
        setImportDone(true)
        toast.error('Import failed', { description: data.error })
        return
      }
      await new Promise((r) => setTimeout(r, 1500))
      return poll()
    }
    return poll()
  }

  const runProgressBar = useCallback((targetPercent: number, onComplete?: () => void) => {
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        const next = Math.min(prev + 4, targetPercent)
        if (next >= targetPercent) {
          clearInterval(interval)
          onComplete?.()
        }
        return next
      })
    }, 80)
    return () => clearInterval(interval)
  }, [])

  const handleImport = async () => {
    setStep(4)
    setImportProgress(0)
    setImportDone(false)
    setImportError(null)
    setImportResult(null)

    let progressCleanup: (() => void) | undefined

    if (file) {
      const apiModule =
        entity === 'contacts' ? contactsApi
        : entity === 'companies' ? companiesApi
        : leadsApi
      const entityLabel = entity
      progressCleanup = runProgressBar(95)
      try {
        const columnMap = buildColumnMap()
        const { data } = await apiModule.import(file, columnMap)
        progressCleanup?.()
        const syncImported = 'imported' in data ? (data as { imported: number }).imported
          : 'created' in data ? data.created
          : null
        if (syncImported !== null) {
          const rawErrors = (data as { errors?: Array<{ row?: number; reason?: string }> }).errors ?? []
          const skipped = (data as { skipped?: number }).skipped ?? 0
          setImportResult({
            imported: syncImported,
            skipped,
            errors: rawErrors.map((e) => ({ row: e.row ?? 0, reason: e.reason ?? '' })),
          })
          setImportProgress(100)
          setImportDone(true)
          queryClient.invalidateQueries({ queryKey: [entity] })
          queryClient.invalidateQueries({ queryKey: [entity, 'stats'] })
          if (entity === 'contacts') {
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.contactsCount })
          }
          toast.success('Import complete', {
            description: `${syncImported} ${entityLabel} imported successfully.`,
          })
        } else if (data?.task_id) {
          progressCleanup = runProgressBar(99)
          await pollImportStatus(data.task_id, entity)
          progressCleanup?.()
        } else {
          setImportError((data as { message?: string })?.message ?? 'Import failed')
          setImportProgress(100)
          setImportDone(true)
          toast.error('Import failed', { description: (data as { message?: string })?.message })
        }
      } catch (err: unknown) {
        progressCleanup?.()
        const msg = err instanceof Error ? err.message : 'Import failed'
        setImportError(msg)
        setImportProgress(100)
        setImportDone(true)
        toast.error('Import failed', { description: msg })
      }
      return
    }
  }

  const totalRows = csvRows.length
  const importedRows = importResult?.imported ?? 0
  const skippedRows = importResult?.skipped ?? 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Import {entity === 'contacts' ? 'Contacts' : entity === 'companies' ? 'Companies' : 'Leads'} from CSV</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload a CSV file to import your data.'}
            {step === 2 && 'Map each CSV column to the correct CRM field.'}
            {step === 3 && 'Review the first 5 rows before importing.'}
            {step === 4 && (importDone ? (importError ? 'Import failed.' : 'Import complete.') : 'Importing your data...')}
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
          <div className="space-y-3 min-w-0">
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
            <div className="min-w-0 overflow-x-auto rounded border">
              <table className="text-xs w-full min-w-max">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    {csvHeaders.map((_, idx) =>
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
                    const hasIssue = requiredColIdx >= 0 && !row[requiredColIdx]?.trim()
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
                                hasIssue && cIdx === requiredColIdx && 'text-amber-600 font-medium'
                              )}
                            >
                              {row[cIdx] || (hasIssue && cIdx === requiredColIdx ? (
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
            ) : importError ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Import failed</span>
                </div>
                <p className="text-sm text-muted-foreground">{importError}</p>
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
                  {importResult && importResult.errors.length > 0 && (
                    <p className="text-amber-600 dark:text-amber-400">
                      {importResult.errors.length} row(s) had errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => downloadTemplate(entity)}>
                <Download className="h-4 w-4 mr-2" />
                Download template
              </Button>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
            </>
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
