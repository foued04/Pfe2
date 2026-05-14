"use client"

import { useI18n } from "@/lib/i18n"
import { MessagesModule } from "@/components/messages-module"

export function OwnerMessagesPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("nav.messages")}</h1>
        <p className="text-muted-foreground">
          {t("messages.subtitle") || "Communiquez avec vos locataires et gérez vos demandes."}
        </p>
      </div>
      <MessagesModule />
    </div>
  )
}
