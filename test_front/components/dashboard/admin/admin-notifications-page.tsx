import { NotificationsModule } from "@/components/notifications-module"

export function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications Admin</h1>
        <p className="text-muted-foreground">
          Alertes système et notifications administratives.
        </p>
      </div>
      <NotificationsModule />
    </div>
  )
}
