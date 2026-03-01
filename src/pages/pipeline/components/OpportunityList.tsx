import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, CheckSquare, Clock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NewTaskDialog } from '@/components/common/NewTaskDialog'
import { LogActivityDialog } from '@/components/common/LogActivityDialog'
import { DataTable } from '@/components/common/DataTable'
import { cn } from '@/lib/utils'
import { currencyFormat } from '../utils'
import { PIPELINE_STAGES, STAGE_CONFIG } from '../data'
import type { Opportunity, Stage } from '../typings'
import { ROUTES } from '@/router/routes'

function DeleteDealDialog({ opportunity, open, onOpenChange }: {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{opportunity.name}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              toast.error('Deal deleted', { description: `"${opportunity.name}" has been removed.` })
              onOpenChange(false)
            }}
          >
            Delete Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OpportunityRowActions({ opportunity }: { opportunity: Opportunity }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={ROUTES.DEAL_DETAIL(opportunity.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Deal
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTaskOpen(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Create Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLogOpen(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Log Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Deal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteDealDialog opportunity={opportunity} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <NewTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <LogActivityDialog open={logOpen} onOpenChange={setLogOpen} entityName={opportunity.name} />
    </>
  )
}

const columns: ColumnDef<Opportunity, unknown>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.name} ${row.company} ${row.contact}`,
    header: 'Deal',
    size: 280,
    cell: ({ row }) => {
      const opp = row.original
      const config = STAGE_CONFIG[opp.stage]
      return (
        <div className={cn('border-l-2 pl-3', config.cardBorderClass.replace('border-l-4', ''))}>
          <Link
            to={ROUTES.DEAL_DETAIL(opp.id)}
            className="font-medium text-sm hover:text-primary hover:underline"
          >
            {opp.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{opp.company} · {opp.contact}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    filterFn: 'equals',
    cell: ({ row }) => {
      const config = STAGE_CONFIG[row.original.stage]
      return (
        <Badge variant="outline" className={cn('text-xs font-medium', config.badgeClass)}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <p className="text-sm font-semibold tabular-nums">
        {currencyFormat.format(row.original.value)}
      </p>
    ),
  },
  {
    accessorKey: 'probability',
    header: 'Probability',
    cell: ({ row }) => {
      const p = row.original.probability
      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${p}%` }} />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-7 text-right">{p}%</span>
        </div>
      )
    },
  },
  {
    id: 'expectedCloseDate',
    accessorFn: (row) => row.expectedCloseDate,
    header: 'Close Date',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">{row.original.expectedCloseDate}</p>
    ),
  },
  {
    id: 'assignedTo',
    accessorFn: (row) => row.assignedTo,
    header: 'Assigned To',
    cell: ({ row }) => {
      const initials = row.original.assignedTo.split(' ').map((n) => n[0]).join('')
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{row.original.assignedTo}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    size: 60,
    enableSorting: false,
    cell: ({ row }) => <OpportunityRowActions opportunity={row.original} />,
  },
]

export function OpportunityList({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <DataTable
      columns={columns}
      data={opportunities}
      searchPlaceholder="Search deals by name, company..."
      toolbar={(table) => (
        <Select
          value={(table.getColumn('stage')?.getFilterValue() as Stage | undefined) ?? 'all'}
          onValueChange={(val) => {
            table.getColumn('stage')?.setFilterValue(val === 'all' ? undefined : val)
            table.setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_CONFIG[stage].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      emptyMessage="No deals found"
      emptyDescription="Try adjusting your search or filters"
    />
  )
}
