"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import {
  Building2,
  CheckCircle2,
  Key,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    key: "dashboard.totalProperties",
    value: 12,
    icon: Building2,
    trend: "+2",
    trendUp: true,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "dashboard.availableProperties",
    value: 4,
    icon: CheckCircle2,
    trend: "+1",
    trendUp: true,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    key: "dashboard.rentedProperties",
    value: 8,
    icon: Key,
    trend: "-1",
    trendUp: false,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    key: "dashboard.estimatedRevenue",
    value: "24 500 TND",
    icon: TrendingUp,
    trend: "+12%",
    trendUp: true,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "dashboard.requestsReceived",
    value: 7,
    icon: FileText,
    trend: "+3",
    trendUp: true,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

export function SummaryCards() {
  const { t } = useI18n()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card
          key={stat.key}
          className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  stat.bgColor
                )}
              >
                {stat.icon && <stat.icon className={cn("h-5 w-5", stat.color)} />}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  stat.trendUp
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t(stat.key)}
              </p>
            </div>
          </CardContent>
          {/* Decorative gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      ))}
    </div>
  )
}
