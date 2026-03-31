import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BulkDeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  entityLabel: string
  onConfirm: () => void
  isDeleting?: boolean
}

export function BulkDeleteConfirmDialog({
  open,
  onOpenChange,
  count,
  entityLabel,
  onConfirm,
  isDeleting = false,
}: BulkDeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete {count} {entityLabel}?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} {entityLabel}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
