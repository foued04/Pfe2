import { PageHeader } from "@/components/dashboard/shared/page-header"
import { MessagesModule } from "@/components/messages-module"

export function OwnerMessagesPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Owner" title="Messages" description="Suivez vos conversations locataires et vos echanges contractuels dans une page dediee." />
      <MessagesModule />
    </div>
  )
}

