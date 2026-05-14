"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ImageIcon, Megaphone, Send, X, Clock, Edit2, Trash2, ChevronRight, MessageSquare, History } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"

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

type Reclamation = {
  _id: string
  title: string
  content: string
  status: string
  attachments: string[]
  claimMeta: {
    claimId: string
    tenantId: string
    tenantName: string
    ownerId: string
    propertyId: string
    propertyTitle: string
    propertyAddress: string
    subject: string
    category: string
    priority: string
    description: string
    photos: string[]
  }
  claimResponse?: {
    message: string
    intervention?: {
      date: string
      time: string
      technician: string
    }
  }
  createdAt: string
  updatedAt: string
}

const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

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

const statusConfig: Record<string, { label: string, color: string }> = {
  "En attente": { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  "En cours": { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "Resolue": { label: "Résolue", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "Refusee": { label: "Refusée", color: "bg-rose-100 text-rose-700 border-rose-200" },
  "Vue par le locateur": { label: "Vue", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"))
    reader.readAsDataURL(file)
  })

export function TenantReclamationsPage() {
  const { user } = useAuth()
  const [units, setUnits] = useState<TenantUnit[]>([])
  const [myReclamations, setMyReclamations] = useState<Reclamation[]>([])
  const [activeTab, setActiveTab] = useState("new")
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [unitKey, setUnitKey] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("maintenance")
  const [priority, setPriority] = useState("medium")
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<ReclamationPhoto[]>([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [requests, reclamations] = await Promise.all([
        apiFetch<any[]>("/rental-requests", { auth: true }),
        apiFetch<Reclamation[]>("/notifications/reclamations/sent", { auth: true })
      ])

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
      if (mappedUnits[0] && !unitKey) {
        setUnitKey(`${mappedUnits[0].propertyId}|${mappedUnits[0].ownerId}`)
      }
      
      setMyReclamations(Array.isArray(reclamations) ? reclamations : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedUnit = useMemo(() => {
    const [propertyId, ownerId] = unitKey.split("|")
    return units.find((unit) => unit.propertyId === propertyId && unit.ownerId === ownerId) || null
  }, [unitKey, units])

  const selectedCategory = categories.find((item) => item.value === category)?.label || "Other"
  const selectedPriority = priorities.find((item) => item.value === priority)?.label || "Medium"

  const handlePhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setSuccess(null)
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

  const resetForm = () => {
    setEditingId(null)
    setSubject("")
    setDescription("")
    setCategory("maintenance")
    setPriority("medium")
    setPhotos([])
    setUnitKey(units[0] ? `${units[0].propertyId}|${units[0].ownerId}` : "")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(null)
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

      const body = {
        recipient: selectedUnit.ownerId,
        type: "Réclamation",
        title,
        preview: `${selectedUnit.title} • ${selectedCategory} • ${selectedPriority}`,
        content,
        status: "En attente",
        attachments: photoDataUrls,
        claimMeta: {
          claimId: editingId ? undefined : `REC-${Date.now()}`,
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
      }

      if (editingId) {
        await apiFetch(`/notifications/reclamations/${editingId}`, {
          auth: true,
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        setSuccess("Your reclamation has been updated.")
      } else {
        await apiFetch("/notifications", {
          auth: true,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        setSuccess("Your reclamation has been sent to the home owner.")
      }

      resetForm()
      fetchData()
      setActiveTab("list")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process the reclamation.")
    } finally {
      setIsSending(false)
    }
  }

  const handleEdit = (rec: Reclamation) => {
    setEditingId(rec._id)
    setSubject(rec.claimMeta.subject)
    setDescription(rec.claimMeta.description)
    setCategory(categories.find(c => c.label === rec.claimMeta.category)?.value || "other")
    setPriority(priorities.find(p => p.label === rec.claimMeta.priority)?.value || "medium")
    setUnitKey(`${rec.claimMeta.propertyId}|${rec.claimMeta.ownerId}`)
    setPhotos(rec.claimMeta.photos.map(url => ({ name: "Existing Photo", type: "image/jpeg", size: 0, dataUrl: url })))
    setActiveTab("new")
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setError(null)
    setSuccess(null)
    try {
      await apiFetch(`/notifications/reclamations/${deleteId}`, {
        auth: true,
        method: "DELETE"
      })
      setSuccess("Reclamation deleted successfully.")
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete.")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant"
        title="Reclamations"
        description="Manage and track your reclamations directly with the property owner."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="new" className="gap-2">
            <Megaphone className="h-4 w-4" />
            {editingId ? "Edit Reclamation" : "New Reclamation"}
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <History className="h-4 w-4" />
            My Reclamations
            {myReclamations.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {myReclamations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {editingId ? <Edit2 className="h-5 w-5 text-primary" /> : <Megaphone className="h-5 w-5 text-primary" />}
                  {editingId ? "Modify your reclamation" : "Submit a new reclamation"}
                </CardTitle>
                <CardDescription>
                  {editingId ? "You can update the details of your pending reclamation." : "Fill out the form below to report an issue to your property owner."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {isLoading && units.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="reclamation-property">Property</Label>
                        <Select value={unitKey} onValueChange={setUnitKey} disabled={!!editingId}>
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

                    <div className="flex justify-end gap-3">
                      {editingId && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={isSending || units.length === 0} className="gap-2">
                        {isSending ? (editingId ? "Updating..." : "Sending...") : (editingId ? "Update reclamation" : "Send reclamation")}
                        {!isSending && <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <div className="grid gap-6">
              {myReclamations.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <CardTitle className="text-muted-foreground">No reclamations yet</CardTitle>
                  <CardDescription>You haven't submitted any reclamations yet.</CardDescription>
                  <Button variant="outline" className="mt-6" onClick={() => setActiveTab("new")}>
                    Submit my first reclamation
                  </Button>
                </Card>
              ) : (
                myReclamations.map((rec) => {
                  const status = statusConfig[rec.status] || { label: rec.status, color: "bg-slate-100 text-slate-700" }
                  const isModifiable = !["Resolue", "Refusee"].includes(rec.status)

                  return (
                    <Card key={rec._id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{rec.claimMeta.subject}</h3>
                                <Badge className={cn("text-[10px] uppercase font-bold", status.color)}>
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Submitted on {new Date(rec.createdAt).toLocaleDateString()}
                                {rec.updatedAt !== rec.createdAt && ` (Modified: ${new Date(rec.updatedAt).toLocaleDateString()})`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isModifiable && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => handleEdit(rec)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => setDeleteId(rec._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 mb-4">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Property</Label>
                              <p className="text-sm font-bold truncate">{rec.claimMeta.propertyTitle}</p>
                              <p className="text-xs text-muted-foreground truncate">{rec.claimMeta.propertyAddress}</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3">
                              <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Type & Priority</Label>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px]">{rec.claimMeta.category}</Badge>
                                <Badge variant="outline" className={cn(
                                  "text-[10px]",
                                  rec.claimMeta.priority === "Urgent" ? "border-red-200 text-red-600 bg-red-50" : ""
                                )}>
                                  {rec.claimMeta.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Message</Label>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">
                              {rec.claimMeta.description}
                            </p>
                          </div>

                          {rec.claimResponse && (
                            <div className="mt-6 border-t pt-4">
                              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 border border-primary/10">
                                <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-xs font-black uppercase text-primary tracking-widest">Owner Response</p>
                                  <p className="text-sm text-slate-700">{rec.claimResponse.message}</p>
                                  {rec.claimResponse.intervention && (
                                    <div className="mt-2 flex flex-wrap gap-3">
                                      <Badge variant="secondary" className="text-[10px] gap-1">
                                        <Clock className="h-3 w-3" />
                                        Intervention: {rec.claimResponse.intervention.date} at {rec.claimResponse.intervention.time}
                                      </Badge>
                                      {rec.claimResponse.intervention.technician && (
                                        <Badge variant="secondary" className="text-[10px]">
                                          Technician: {rec.claimResponse.intervention.technician}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {rec.claimMeta.photos && rec.claimMeta.photos.length > 0 && (
                          <div className="w-full md:w-64 bg-muted/20 p-4 border-l">
                            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-2 block">Attached Photos</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {rec.claimMeta.photos.slice(0, 4).map((photo, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden border bg-background group cursor-pointer relative">
                                  <img src={photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Attachment" />
                                  {i === 3 && rec.claimMeta.photos.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">
                                      +{rec.claimMeta.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this reclamation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The property owner will no longer see this reclamation in their dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
