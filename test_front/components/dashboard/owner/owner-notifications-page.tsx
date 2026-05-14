"use client"

import { useI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { NotificationsModule } from "@/components/notifications-module"

export function OwnerNotificationsPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("role.owner")}
        title={t("nav.notifications")}
        description="Consultez les messages, reclamations et alertes recus depuis vos locataires."
      />
      <NotificationsModule />
    </div>
  )
}
