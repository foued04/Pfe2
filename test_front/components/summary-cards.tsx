"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import type { Property } from "@/lib/property-data"
import {
  Building2,
  CheckCircle2,
  Key,
  FileText,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryCardsProps {
  properties: Property[]
  requestsCount: number
}

export function SummaryCards({ properties = [], requestsCount = 0 }: SummaryCardsProps) {
  const { t } = useI18n()

  const totalProperties = properties.length
  const availableProperties = properties.filter(p => p.status === "available").length
  const rentedProperties = properties.filter(p => p.status === "rented").length
  const estimatedRevenue = properties
    .filter(p => p.status === "rented")
    .reduce((acc, p) => acc + (p.rent || 0), 0)

  const stats = [
    {
      key: "dashboard.totalProperties",
      value: totalProperties,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "dashboard.availableProperties",
      value: availableProperties,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      key: "dashboard.rentedProperties",
      value: rentedProperties,
      icon: Key,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      key: "dashboard.estimatedRevenue",
      value: `${estimatedRevenue.toLocaleString()} TND`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "dashboard.requestsReceived",
      value: requestsCount,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

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
