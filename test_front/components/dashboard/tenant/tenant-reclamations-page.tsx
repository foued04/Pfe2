"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ImageIcon, Megaphone, Send, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type TenantUnit = {
  propertyId: string
  ownerId: string
  title: string
  address: string
  status: string
}

type ReclamationPhoto = {
  name: string
  type: string
  size: number
  dataUrl: string
}

const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"))
    reader.readAsDataURL(file)
  })

const categories = [
  { value: "maintenance", label: "Maintenance" },
  { value: "payment", label: "Payment" },
  { value: "contract", label: "Contract" },
  { value: "neighborhood", label: "Neighborhood" },
  { value: "other", label: "Other" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function TenantReclamationsPage() {
  const { user } = useAuth()
  const [units, setUnits] = useState<TenantUnit[]>([])
  const [unitKey, setUnitKey] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("maintenance")
  const [priority, setPriority] = useState("medium")
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<ReclamationPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let active = true

    apiFetch<any[]>("/rental-requests", { auth: true })
      .then((requests) => {
        if (!active) return

        const mappedUnits = (Array.isArray(requests) ? requests : [])
          .map((request) => ({
            propertyId: String(request.property?._id || ""),
            ownerId: String(request.property?.owner?._id || request.property?.owner || ""),
            title: String(request.property?.title || "Property"),
            address: String(request.property?.address || ""),
            status: String(request.status || ""),
          }))
          .filter((unit) => unit.propertyId && unit.ownerId)
          .filter((unit) => !unit.status.toLowerCase().includes("refus"))
          .filter(
            (unit, index, list) =>
              list.findIndex((item) => item.propertyId === unit.propertyId && item.ownerId === unit.ownerId) === index,
          )

        setUnits(mappedUnits)
        setUnitKey((current) => current || (mappedUnits[0] ? `${mappedUnits[0].propertyId}|${mappedUnits[0].ownerId}` : ""))
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load your properties.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const selectedUnit = useMemo(() => {
    const [propertyId, ownerId] = unitKey.split("|")
    return units.find((unit) => unit.propertyId === propertyId && unit.ownerId === ownerId) || null
  }, [unitKey, units])

  const selectedCategory = categories.find((item) => item.value === category)?.label || "Other"
  const selectedPriority = priorities.find((item) => item.value === priority)?.label || "Medium"

  const handlePhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setSuccess(false)
    setError(null)

    const availableSlots = Math.max(0, MAX_PHOTOS - photos.length)
    const filesToRead = files.slice(0, availableSlots)

    if (files.length > availableSlots) {
      setError(`You can attach up to ${MAX_PHOTOS} photos.`)
    }

    try {
      const nextPhotos = await Promise.all(
        filesToRead.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("INVALID_TYPE")
          }

          if (file.size > MAX_PHOTO_SIZE) {
            throw new Error("TOO_LARGE")
          }

          return {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: await readFileAsDataUrl(file),
          }
        }),
      )

      setPhotos((current) => [...current, ...nextPhotos])
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_TYPE") {
        setError("Please select image files only.")
      } else if (err instanceof Error && err.message === "TOO_LARGE") {
        setError("Each photo must be smaller than 5 MB.")
      } else {
        setError("Unable to import the selected photos.")
      }
    } finally {
      event.target.value = ""
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(false)
    setError(null)

    if (!selectedUnit) {
      setError("Please choose the property related to this reclamation.")
      return
    }

    setIsSending(true)

    try {
      const cleanSubject = subject.trim()
      const cleanDescription = description.trim()
      const title = cleanSubject || `Reclamation - ${selectedCategory}`
      const photoDataUrls = photos.map((photo) => photo.dataUrl)
      const content = [
        `Tenant: ${user?.name || "-"}`,
        `Property: ${selectedUnit.title}`,
        `Address: ${selectedUnit.address || "-"}`,
        `Category: ${selectedCategory}`,
        `Priority: ${selectedPriority}`,
        "",
        cleanDescription,
      ].join("\n")

      await apiFetch("/notifications", {
        auth: true,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: selectedUnit.ownerId,
          type: "Réclamation",
          title,
          preview: `${selectedUnit.title} • ${selectedCategory} • ${selectedPriority}`,
          content,
          status: "En attente",
          attachments: photoDataUrls,
          claimMeta: {
            claimId: `REC-${Date.now()}`,
            tenantId: user?.id || "",
            tenantName: user?.name || "",
            ownerId: selectedUnit.ownerId,
            propertyId: selectedUnit.propertyId,
            propertyTitle: selectedUnit.title,
            propertyAddress: selectedUnit.address,
            subject: title,
            category: selectedCategory,
            priority: selectedPriority,
            description: cleanDescription,
            source: "tenant",
            photos: photoDataUrls,
          },
        }),
      })

      setSuccess(true)
      setSubject("")
      setDescription("")
      setCategory("maintenance")
      setPriority("medium")
      setPhotos([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the reclamation.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant"
        title="Reclamation"
        description="Send a reclamation directly to the home owner responsible for your property."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-primary" />
            New reclamation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Your reclamation has been sent to the home owner.
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your properties...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reclamation-property">Property</Label>
                  <Select value={unitKey} onValueChange={setUnitKey}>
                    <SelectTrigger id="reclamation-property">
                      <SelectValue placeholder="Choose a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No property available
                        </SelectItem>
                      ) : (
                        units.map((unit) => (
                          <SelectItem key={`${unit.propertyId}|${unit.ownerId}`} value={`${unit.propertyId}|${unit.ownerId}`}>
                            {unit.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedUnit && <p className="text-xs text-muted-foreground">{selectedUnit.address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reclamation-subject">Subject</Label>
                  <Input
                    id="reclamation-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Example: Water leak in kitchen"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reclamation-category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="reclamation-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reclamation-priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="reclamation-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reclamation-description">Description</Label>
                <Textarea
                  id="reclamation-description"
                  className="min-h-40 resize-none"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the problem and what you need from the home owner."
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="reclamation-photos">Photos</Label>
                <label
                  htmlFor="reclamation-photos"
                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-3 text-center transition-colors hover:bg-muted/40"
                >
                  {photos.length > 0 ? (
                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {photos.map((photo, index) => (
                        <div key={`${photo.name}-${index}`} className="relative overflow-hidden rounded-lg border bg-background shadow-sm">
                          <img src={photo.dataUrl} alt={photo.name} className="h-32 w-full object-cover" />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault()
                              removePhoto(index)
                            }}
                            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                            aria-label="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Import photos of the reclamation</span>
                    </>
                  )}
                  <input
                    id="reclamation-photos"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handlePhotosChange}
                    disabled={photos.length >= MAX_PHOTOS}
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSending || units.length === 0} className="gap-2">
                  {isSending ? "Sending..." : "Send reclamation"}
                  {!isSending && <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
