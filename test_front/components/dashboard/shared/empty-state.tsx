import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-border bg-muted/40 p-8 text-center">
      <div>
        <Icon className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

