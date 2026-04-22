import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export function StatsGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string | number; icon: LucideIcon; tone?: string }>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="mt-2 text-3xl font-black tracking-tight">{stat.value}</div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

