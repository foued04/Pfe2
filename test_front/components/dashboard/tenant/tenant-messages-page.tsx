import { MessagesModule } from "@/components/messages-module"

export function TenantMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Gérez vos conversations avec les locateurs et l'assistance.
        </p>
      </div>
      <MessagesModule />
    </div>
  )
}
