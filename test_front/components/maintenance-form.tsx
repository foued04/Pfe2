"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  Building2,
  ShieldCheck,
  Clock3,
  X,
  ListChecks,
} from "lucide-react"

type UnitOption = {
  propertyId: string
  ownerId: string
  title: string
  address: string
}

type UploadedAttachment = {
  name: string
  type: string
  size: number
  dataUrl: string
}

type ClaimNotification = {
  id: string
  title: string
  preview: string
  content: string
  status: string
  createdAt: string
  claimResponse?: {
    message?: string
    intervention?: {
      date?: string
      time?: string
      technician?: string
    }
  }
  attachments?: Array<UploadedAttachment | string>
  claimMeta?: {
    claimId?: string
    tenantId?: string
    ownerId?: string
    propertyId?: string
    propertyTitle?: string
    category?: string
    priority?: string
    photos?: string[]
  }
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const MAX_PHOTOS = 5

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"))
    reader.readAsDataURL(file)
  })

export function MaintenanceForm() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaimsLoading, setIsClaimsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [units, setUnits] = useState<UnitOption[]>([])
  const [claims, setClaims] = useState<ClaimNotification[]>([])

  const [subject, setSubject] = useState("")
  const [unitKey, setUnitKey] = useState("")
  const [category, setCategory] = useState("plumbing")
  const [priority, setPriority] = useState("medium")
  const [description, setDescription] = useState("")
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    const fetchTenantUnits = async () => {
      setFetchError(null)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) return

        const response = await fetch(`${API_URL}/rental-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          setFetchError("Impossible de charger vos logements.")
          return
        }

        const data = await response.json()
        const dataArray = Array.isArray(data) ? data : []
        const rawUnits = dataArray
          .map((r: any) => ({
            propertyId: String(r.property?._id || ""),
            ownerId: String(r.property?.owner?._id || r.property?.owner || ""),
            title: String(r.property?.title || "Logement"),
            address: String(r.property?.address || ""),
            status: String(r.status || ""),
          }))
          .filter((u: any) => u.propertyId && u.ownerId)
          .filter((u: any) => u.status !== "Refusée")

        const unique = rawUnits.filter(
          (u: any, idx: number, arr: any[]) =>
            arr.findIndex((x: any) => x.propertyId === u.propertyId && x.ownerId === u.ownerId) === idx
        )
        setUnits(unique)
        if (unique.length > 0) {
          setUnitKey((prev) => prev || `${unique[0].propertyId}|${unique[0].ownerId}`)
        }
      } catch (err) {
        console.error("Fetch tenant units error:", err)
        setFetchError("Erreur de connexion.")
      }
    }

    fetchTenantUnits()
  }, [API_URL])

  const fetchClaims = useCallback(async () => {
    if (!user?.id) return
    setIsClaimsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) return

      const data = await response.json()
      const dataArray = Array.isArray(data) ? data : []

      const mappedClaims = dataArray
        .filter((n: any) => n.type === "Réclamation" || n.type === "Reclamation")
        .filter((n: any) => n.claimMeta?.tenantId === user.id)
        .map((n: any) => ({
          id: n._id,
          title: String(n.title || "Reclamation"),
          preview: String(n.preview || ""),
          content: String(n.content || ""),
          status: String(n.status || "En attente"),
          createdAt: String(n.createdAt || ""),
          claimResponse: n.claimResponse,
          attachments: Array.isArray(n.attachments) ? n.attachments : [],
          claimMeta: n.claimMeta,
        }))
        .sort((a: ClaimNotification, b: ClaimNotification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setClaims(mappedClaims)
    } catch (err) {
      console.error("Fetch claims error:", err)
    } finally {
      setIsClaimsLoading(false)
    }
  }, [API_URL, user?.id])

  useEffect(() => {
    fetchClaims()
    const interval = setInterval(fetchClaims, 30000)
    return () => clearInterval(interval)
  }, [fetchClaims])

  const selectedUnit = useMemo(() => {
    if (unitKey) {
      const [propertyId, ownerId] = unitKey.split("|")
      const found = units.find((u) => u.propertyId === propertyId && u.ownerId === ownerId)
      if (found) return found
    }
    return units.length > 0 ? units[0] : null
  }, [unitKey, units])

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = Math.max(0, MAX_PHOTOS - attachments.length)
    const filesToProcess = files.slice(0, remainingSlots)

    if (attachments.length + files.length > MAX_PHOTOS) {
      setSubmitError(`Maximum ${MAX_PHOTOS} photos autorisées.`)
    }

    try {
      const uploaded = await Promise.all(
        filesToProcess.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("INVALID_TYPE")
          }
          if (file.size > MAX_PHOTO_SIZE) {
            throw new Error("TOO_LARGE")
          }

          const dataUrl = await readFileAsDataUrl(file)
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl,
          } as UploadedAttachment
        })
      )

      setAttachments((prev) => [...prev, ...uploaded])
      setSubmitError(null)
    } catch (err: any) {
      if (err?.message === "TOO_LARGE") {
        setSubmitError("Chaque photo doit être inférieure à 5MB.")
      } else if (err?.message === "INVALID_TYPE") {
        setSubmitError("Veuillez sélectionner uniquement des images.")
      } else {
        setSubmitError("Impossible de lire les photos sélectionnées.")
      }
    } finally {
      e.target.value = ""
    }
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitted(false)
    if (!selectedUnit) {
      setSubmitError("Veuillez sélectionner un logement.")
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setSubmitError("Session expiree. Veuillez vous reconnecter.")
      return
    }
    setIsLoading(true)

    try {
      const categoryLabel =
        category === "plumbing" ? t("maintenance.cat.plumbing")
        : category === "electricity" ? t("maintenance.cat.electricity")
        : category === "heating" ? t("maintenance.cat.heating")
        : category === "appliance" ? t("maintenance.cat.appliance")
        : t("maintenance.cat.other")
      const priorityLabel =
        priority === "low" ? t("maintenance.pri.low")
        : priority === "high" ? t("maintenance.pri.high")
        : t("maintenance.pri.medium")
      const attachmentPayload = attachments.map((a) => a.dataUrl)

      const claimId = `CLM-${Date.now()}`
      const sharedClaimMeta = {
        claimId,
        tenantId: user?.id || "",
        ownerId: selectedUnit.ownerId,
        propertyId: selectedUnit.propertyId,
        propertyTitle: selectedUnit.title,
        category: categoryLabel,
        priority: priorityLabel,
        photos: attachments.map((a) => a.dataUrl),
      }

      const notifPayload = {
        recipient: selectedUnit.ownerId,
        type: "Réclamation",
        title: subject.trim() || "Nouvelle réclamation",
        preview: `${categoryLabel} • ${priorityLabel}`,
        content: [
          `Locataire: ${user?.name || "-"}`,
          `Bien: ${selectedUnit.title}`,
          `Adresse: ${selectedUnit.address || "-"}`,
          `Categorie: ${categoryLabel}`,
          `Priorite: ${priorityLabel}`,
          "",
          description.trim(),
        ].join("\n"),
        attachments: attachmentPayload,
        claimMeta: {
          ...sharedClaimMeta,
          source: "owner",
        },
      }

      const notifResponse = await fetch(`${API_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifPayload),
      })

      if (!notifResponse.ok) {
        const err = await notifResponse.json().catch(() => null)
        setSubmitError(err?.message || "Echec de l'envoi de la réclamation.")
        return
      }

      await fetch(`${API_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: user?.id,
          type: "Réclamation",
          title: `Suivi Reclamation - ${subject.trim() || categoryLabel}`,
          preview: `${lang === "fr" ? "Statut" : "Status"}: En attente`,
          content: description.trim(),
          status: "En attente",
          attachments: attachmentPayload,
          claimMeta: {
            ...sharedClaimMeta,
            source: "tenant",
          },
        }),
      }).catch(() => null)

      await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUnit.ownerId,
          category: "Maintenance",
          contextId: `maintenance-${selectedUnit.propertyId}`,
          contextTitle: `Maintenance - ${selectedUnit.title}`,
          content: `${subject}\n${description}${attachments.length > 0 ? `\n\nPhotos: ${attachments.length}` : ""}`,
        }),
      }).catch(() => null)

      setIsSubmitted(true)
      setSubject("")
      setDescription("")
      setCategory("plumbing")
      setPriority("medium")
      setAttachments([])
      await fetchClaims()
    } catch (err) {
      console.error("Submit maintenance error:", err)
      setSubmitError("Erreur de connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (value: string) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <CardContent className="py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Wrench className="w-8 h-8 text-cyan-300" />
                {t("maintenance.title")}
              </h2>
          claimMeta: {
            ...sharedClaimMeta,
            source: "tenant",
          },
        }),
      }).catch(() => null)

      await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUnit.ownerId,
          category: "Maintenance",
          contextId: `maintenance-${selectedUnit.propertyId}`,
          contextTitle: `Maintenance - ${selectedUnit.title}`,
          content: `${subject}\n${description}${attachments.length > 0 ? `\n\nPhotos: ${attachments.length}` : ""}`,
        }),
      }).catch(() => null)

      setIsSubmitted(true)
      setSubject("")
      setDescription("")
      setCategory("plumbing")
      setPriority("medium")
      setAttachments([])
      await fetchClaims()
    } catch (err) {
      console.error("Submit maintenance error:", err)
      setSubmitError("Erreur de connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (value: string) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <CardContent className="py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Wrench className="w-8 h-8 text-cyan-300" />
                {t("maintenance.title")}
              </h2>
              <p className="mt-2 text-slate-200">{t("maintenance.subtitle")}</p>
            </div>
            <div className="flex gap-3 text-xs font-bold uppercase tracking-wider">
              <div className="rounded-full bg-white/10 px-3 py-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Suivi locateur
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1.5 flex items-center gap-1.5">
                <Clock3 className="w-4 h-4 text-amber-300" />
                Traitement rapide
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-lg">
        <CardHeader className="bg-secondary/10 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Détails de l&apos;intervention
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {isSubmitted && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <p className="text-sm font-medium">Votre Réclamation a bien été envoyée. Vous pouvez suivre son état ci-dessous.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.subject")}</label>
                <Input
                  placeholder="Ex: Fuite d'eau cuisine"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.unit")}</label>
                <Select value={unitKey} onValueChange={setUnitKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un logement" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.length === 0 ? (
                      <SelectItem value="no-unit" disabled>
                        Aucun logement disponible
                      </SelectItem>
                    ) : (
                      units.map((u) => (
                        <SelectItem key={`${u.propertyId}|${u.ownerId}`} value={`${u.propertyId}|${u.ownerId}`}>
                          {u.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedUnit && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {selectedUnit.address}
                  </p>
                )}
                {fetchError && <p className="text-xs text-destructive">{fetchError}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.category")}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">{t("maintenance.cat.plumbing")}</SelectItem>
                    <SelectItem value="electricity">{t("maintenance.cat.electricity")}</SelectItem>
                    <SelectItem value="heating">{t("maintenance.cat.heating")}</SelectItem>
                    <SelectItem value="appliance">{t("maintenance.cat.appliance")}</SelectItem>
                    <SelectItem value="other">{t("maintenance.cat.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.priority")}</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("maintenance.pri.low")}</SelectItem>
                    <SelectItem value="medium">{t("maintenance.pri.medium")}</SelectItem>
                    <SelectItem value="high" className="text-red-500 font-bold">
                      {t("maintenance.pri.high")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("maintenance.description")}</label>
              <Textarea
                placeholder="Veuillez décrire le problème avec précision."
                className="min-h-[150px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Photos (Optionnel)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 transition-colors px-4 py-6">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Cliquez pour ajouter des photos (max {MAX_PHOTOS}, 5MB/photo)
                    </p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFilesChange} />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  {attachments.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="relative rounded-lg border overflow-hidden bg-muted/30">
                      <img src={file.dataUrl} alt={file.name} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-1 hover:bg-black"
                        aria-label="Supprimer la photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="px-8"
                onClick={() => {
                  setSubject("")
                  setDescription("")
                  setCategory("plumbing")
                  setPriority("medium")
                  setAttachments([])
                  setSubmitError(null)
                }}
              >
                {t("form.cancel")}
              </Button>

              <Button type="submit" className="px-10 gap-2" disabled={isLoading || !selectedUnit}>
                {isLoading ? t("general.loading") : t("maintenance.submit")}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
            {submitError && <p className="text-sm font-semibold text-destructive">{submitError}</p>}
          </form>
        </CardContent>
      </Card>

      <Card className="border-border shadow-lg">
        <CardHeader className="bg-secondary/10 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-600" />
            Suivi de mes Réclamations
          </CardTitle>
          <CardDescription>
            Consultez l&apos;état de traitement de vos Réclamations, les Réponses du locateur et les interventions prévues.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isClaimsLoading ? (
            <p className="text-sm text-muted-foreground">Chargement des Réclamations...</p>
          ) : claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune Réclamation enregistrée pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => {
                const photosFromAttachments =
                  claim.attachments
                    ?.map((a) => (typeof a === "string" ? a : a?.dataUrl))
                    .filter(Boolean) || []
                const photos =
                  photosFromAttachments.length > 0
                    ? photosFromAttachments
                    : claim.claimMeta?.photos?.filter(Boolean) || []
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-2 p-4 rounded-lg bg-amber-50 border border-amber-100 flex gap-3 text-amber-800 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p>
          <strong>Note :</strong> Pour les urgences vitales (fuite de gaz, incendie),
          veuillez contacter directement les services d&apos;urgence au 198 ou 190.
        </p>
      </div>
    </div>
  )
}

