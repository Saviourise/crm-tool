interface ActivityHeaderProps {
  total: number
}

export function ActivityHeader({ total }: ActivityHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Activity Log</h1>
      <p className="text-muted-foreground mt-1">
        {total} activit{total !== 1 ? 'ies' : 'y'} across leads, contacts, tasks, and deals
      </p>
    </div>
  )
}
