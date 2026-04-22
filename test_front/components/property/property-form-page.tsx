"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { OwnerPropertyForm } from "@/components/owner-property-form"
import { Card, CardContent } from "@/components/ui/card"

export function PropertyFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const [initialData, setInitialData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(!!editId)

  useEffect(() => {
    if (!editId) return
    let active = true
    setIsLoading(true)
    apiFetch<any>(`/properties/${editId}`, { auth: true })
      .then((data) => {
        if (!active) return
        setInitialData(data)
      })
      .catch((err) => {
        console.error("Failed to load property for edit:", err)
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [editId])

  const title = useMemo(() => (editId ? "Modifier la propriete" : "Ajouter une propriete"), [editId])

  const handleSave = async (payload: any) => {
    const path = editId ? `/properties/${editId}` : "/properties"
    const method = editId ? "PUT" : "POST"

    await apiFetch(path, {
      auth: true,
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    router.push("/dashboard/owner/properties")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Utilisez le formulaire centralise pour creer ou mettre a jour un bien.</p>
      </div>
      {isLoading ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground">Chargement du formulaire...</CardContent></Card>
      ) : (
        <OwnerPropertyForm initialData={initialData || undefined} onSave={handleSave} onCancel={() => router.push("/dashboard/owner/properties")} />
      )}
    </div>
  )
}

