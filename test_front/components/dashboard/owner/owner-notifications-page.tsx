import { PageHeader } from "@/components/dashboard/shared/page-header"
import { MessagesModule } from "@/components/messages-module"

export function OwnerNotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Owner"
        title="Notifications"
        description="Consultez les messages et echanges recus depuis vos locataires."
      />
      <MessagesModule />
    </div>
  )
}
