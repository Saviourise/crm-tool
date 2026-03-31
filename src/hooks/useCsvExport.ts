import { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface UseCsvExportOptions {
  request: () => Promise<{ data: Blob }>
  filename: string | (() => string)
  successTitle: string
  successDescription: string
  errorTitle: string
  errorDescription: string
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function useCsvExport({
  request,
  filename,
  successTitle,
  successDescription,
  errorTitle,
  errorDescription,
}: UseCsvExportOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const exportCsv = useCallback(async () => {
    try {
      setIsExporting(true)
      const { data } = await request()
      const name = typeof filename === 'function' ? filename() : filename
      downloadBlob(data, name)
      toast.success(successTitle, { description: successDescription })
    } catch {
      toast.error(errorTitle, { description: errorDescription })
    } finally {
      setIsExporting(false)
    }
  }, [request, filename, successTitle, successDescription, errorTitle, errorDescription])

  return { exportCsv, isExporting }
}
