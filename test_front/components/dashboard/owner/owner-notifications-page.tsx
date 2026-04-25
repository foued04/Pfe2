import { PageHeader } from "@/components/dashboard/shared/page-header"
import { NotificationsModule } from "@/components/notifications-module"

export function OwnerNotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Owner"
        title="Notifications"
        description="Consultez les messages, reclamations et alertes recus depuis vos locataires."
      />
      <NotificationsModule />
    </div>
  )
}
