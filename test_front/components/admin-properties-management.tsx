"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BadgeCheck,
  Building,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Filter,
  Home,
  Layers,
  Mail,
  MapPin,
  Package,
  Phone,
  ScanSearch,
  Search,
  ShieldCheck,
  Sofa,
  Trash2,
  User,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { resolveApiUrl } from "@/lib/api/client"
import { type Property, mapBackendProperty as centralMapBackendProperty } from "@/lib/property-data"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

type ValidationStatus = "pending" | "approved" | "rejected"

interface ManagedProperty extends Property {
  validationStatus: ValidationStatus
  rejectionReason?: string
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().slice(0, 10)
}

const mapBackendProperty = (property: any): ManagedProperty => {
  const mapped = centralMapBackendProperty(property)
  return {
    ...mapped,
    validationStatus: property.moderationStatus || property.validationStatus || "pending",
    rejectionReason: property.rejectionReason || "",
    createdAt: formatDate(property.createdAt),
  }
}

export function AdminPropertiesManagement() {
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [filter, setFilter] = useState({ search: "", status: "all", city: "all" })
  const [selectedProperty, setSelectedProperty] = useState<ManagedProperty | null>(null)
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const API_URL = resolveApiUrl()

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const haystack = `${property.title} ${property.ownerName} ${property.city} ${property.address}`.toLowerCase()
      const matchesSearch = haystack.includes(filter.search.toLowerCase())
      const matchesStatus = filter.status === "all" || property.validationStatus === filter.status
      const matchesCity = filter.city === "all" || property.city === filter.city
      return matchesSearch && matchesStatus && matchesCity
    })
  }, [filter, properties])

  const moderationSummary = useMemo(() => {
    return {
      total: properties.length,
      pending: properties.filter((property) => property.validationStatus === "pending").length,
      approved: properties.filter((property) => property.validationStatus === "approved").length,
      rejected: properties.filter((property) => property.validationStatus === "rejected").length,
    }
  }, [properties])

  const cityOptions = useMemo(() => {
    return Array.from(new Set(properties.map((property) => property.city).filter(Boolean))).sort()
  }, [properties])

  const syncPropertyState = (id: string, validationStatus: ValidationStatus, reason?: string) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === id ? { ...property, validationStatus, rejectionReason: reason || "" } : property,
      ),
    )
    setSelectedProperty((prev) =>
      prev && prev.id === id ? { ...prev, validationStatus, rejectionReason: reason || "" } : prev,
    )
  }

  const fetchProperties = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des proprietes.")
      }

      const data = await response.json()
      setProperties((Array.isArray(data) ? data : []).map(mapBackendProperty))
    } catch (error) {
      console.error("Error fetching admin properties:", error)
      alert("Impossible de charger les proprietes.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (!selectedProperty) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedProperty])

  const updateModerationStatus = async (id: string, validationStatus: ValidationStatus, reason?: string) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          moderationStatus: validationStatus,
          rejectionReason: reason || "",
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || "Erreur lors de la mise a jour du statut.")
      }

      syncPropertyState(id, validationStatus, reason)
      return true
    } catch (error) {
      console.error("Error updating moderation status:", error)
      alert(error instanceof Error ? error.message : "Erreur lors de la mise a jour du statut.")
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  const handleApprove = async (id: string) => {
    const success = await updateModerationStatus(id, "approved")
    if (!success) return

    if (selectedProperty?.id === id) {
      closeProperty()
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) return
    const success = await updateModerationStatus(id, "rejected", rejectionReason.trim())
    if (!success) return

    if (selectedProperty?.id === id) {
      closeProperty()
    }
  }

  const handleQuickReject = async (property: ManagedProperty) => {
    const fallbackReason = property.rejectionReason?.trim() || "Annonce rejetee par l'administrateur."
    const reason = window.prompt("Motif du rejet", fallbackReason)

    if (reason === null) return

    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      alert("Veuillez saisir un motif de rejet.")
      return
    }

    await updateModerationStatus(property.id, "rejected", trimmedReason)
  }
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Etes-vous sur de vouloir supprimer DEFINITIVEMENT cette propriete ? Cette action est irreversible.")) {
      return
    }

    setUpdatingId(id)
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || "Erreur lors de la suppression.")
      }

      setProperties((prev) => prev.filter((p) => p.id !== id))
      if (selectedProperty?.id === id) {
        closeProperty()
      }
      alert("Propriete supprimee avec succes.")
    } catch (error) {
      console.error("Error deleting property:", error)
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression.")
    } finally {
      setUpdatingId(null)
    }
  }

  const openProperty = (property: ManagedProperty) => {
    setSelectedProperty(property)
    setActiveImage(property.images.cover)
    setRejectionReason(property.rejectionReason || "")
  }

  const closeProperty = () => {
    setSelectedProperty(null)
    setActiveImage(null)
    setRejectionReason("")
  }

  const toggleExpandedProperty = (id: string) => {
    setExpandedPropertyId((prev) => (prev === id ? null : id))
  }

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">Publie</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-none font-bold">En attente</Badge>
      case "rejected":
        return <Badge className="bg-rose-100 text-rose-700 border-none font-bold">Rejete</Badge>
    }
  }

  const gallery = selectedProperty
    ? [
        selectedProperty.images.cover,
        selectedProperty.images.kitchen,
        selectedProperty.images.bathroom,
        selectedProperty.images.bedroom,
        selectedProperty.images.livingRoom,
        selectedProperty.images.exterior,
      ].filter((image): image is string => Boolean(image))
    : []

  const reviewChecklist = selectedProperty
    ? [
        { label: "Description detaillee", ok: selectedProperty.description.trim().length > 60 },
        { label: "Galerie suffisante", ok: gallery.length >= 3 },
        { label: "Tarification renseignee", ok: selectedProperty.rent > 0 && selectedProperty.deposit >= 0 },
        { label: "Coordonnees locateur", ok: Boolean(selectedProperty.ownerName && selectedProperty.ownerEmail && selectedProperty.ownerPhone) },
      ]
    : []

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Moderation des proprietes</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Consultez chaque bien comme un dossier de validation, puis approuvez ou refusez avec une interface de decision claire.
          </p>
        </div>
        <Badge variant="outline" className="w-fit rounded-full bg-primary/5 px-4 py-2 font-bold text-primary border-primary/15">
          {moderationSummary.pending} biens a traiter
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Biens en file", value: moderationSummary.total, note: "Volume total", icon: ClipboardList, tone: "bg-slate-50 text-slate-700" },
          { label: "En attente", value: moderationSummary.pending, note: "Decision requise", icon: ScanSearch, tone: "bg-amber-50 text-amber-700" },
          { label: "Publies", value: moderationSummary.approved, note: "Diffusion active", icon: BadgeCheck, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Refuses", value: moderationSummary.rejected, note: "Correction demandee", icon: AlertCircle, tone: "bg-rose-50 text-rose-700" },
        ].map((item) => (
          <Card key={item.label} className="border-none shadow-lg bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">{item.note}</p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", item.tone)}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-card p-4 shadow-xl">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre, locateur, ville ou adresse"
              className="w-full rounded-2xl bg-muted/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-0 transition focus:bg-muted"
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <select
              className="rounded-2xl bg-muted/50 px-4 py-2.5 text-sm font-bold text-muted-foreground outline-none"
              value={filter.status}
              onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Publies</option>
              <option value="rejected">Rejetes</option>
            </select>
            <select
              className="rounded-2xl bg-muted/50 px-4 py-2.5 text-sm font-bold text-muted-foreground outline-none"
              value={filter.city}
              onChange={(e) => setFilter((prev) => ({ ...prev, city: e.target.value }))}
            >
              <option value="all">Toutes les villes</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div className="hidden h-11 items-center rounded-2xl bg-primary/5 px-4 text-primary md:flex">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {isLoading ? (
          <Card className="border-none bg-card p-8 shadow-xl">
            <p className="text-sm font-bold text-muted-foreground">Chargement des proprietes...</p>
          </Card>
        ) : null}

        {!isLoading && filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden border-none bg-card shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col lg:flex-row">
              <div className="relative h-52 w-full shrink-0 overflow-hidden lg:h-auto lg:w-72">
                <img src={property.images.cover} alt={property.title} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4">{getStatusBadge(property.validationStatus)}</div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">{property.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-primary" />
                          {property.type}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {property.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black tracking-tight text-primary">{property.rent} DT</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Loyer mensuel</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 border-y border-border/50 py-4 md:grid-cols-4">
                    <MetaBlock icon={User} label="Locateur" value={property.ownerName} accent="text-orange-500" />
                    <MetaBlock icon={Calendar} label="Ajoute le" value={property.createdAt || "-"} accent="text-emerald-500" />
                    <MetaBlock icon={Home} label="Surface" value={`${property.surface} m2`} accent="text-blue-500" />
                    <div className="md:col-span-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Adresse</p>
                      <p className="mt-2 truncate text-sm font-bold text-foreground">{property.address}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <div className={`grid gap-2 ${property.validationStatus === "pending" ? "lg:grid-cols-[1fr_1fr_auto_auto]" : "lg:grid-cols-[auto_auto]"}`}>
                    {property.validationStatus === "pending" ? (
                      <>
                        <Button
                          onClick={() => handleApprove(property.id)}
                          disabled={updatingId === property.id}
                          className="h-11 flex-1 rounded-2xl bg-emerald-500 font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-600"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {updatingId === property.id ? "..." : "Approuver"}
                        </Button>
                        <Button
                          onClick={() => handleQuickReject(property)}
                          variant="outline"
                          className="h-11 flex-1 rounded-2xl border-red-200 bg-red-50 font-black uppercase tracking-[0.12em] text-red-600 hover:bg-red-100"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                      </>
                    ) : null}

                    <Button
                      onClick={() => toggleExpandedProperty(property.id)}
                      variant="outline"
                      className="h-11 rounded-2xl border-slate-200 bg-slate-50 px-5 font-black uppercase tracking-[0.12em] text-slate-700 hover:bg-slate-100"
                    >
                      <ChevronDown className={cn("mr-2 h-4 w-4 transition-transform", expandedPropertyId === property.id ? "rotate-180" : "")} />
                      {expandedPropertyId === property.id ? "Masquer les details" : "Voir les details"}
                    </Button>

                    <Button
                      onClick={() => handleDelete(property.id)}
                      disabled={updatingId === property.id}
                      variant="outline"
                      className="h-11 rounded-2xl border-red-200 bg-red-50 px-5 font-black uppercase tracking-[0.12em] text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </div>

                  {expandedPropertyId === property.id ? (
                    <div className="grid gap-3 rounded-3xl border border-border/60 bg-slate-50/80 p-4 md:grid-cols-2 xl:grid-cols-4">
                      <InlineDetail label="Description" value={property.description || "Aucune description"} className="md:col-span-2 xl:col-span-2" />
                      <InlineDetail label="Chambres" value={String(property.bedrooms)} />
                      <InlineDetail label="Salles de bain" value={String(property.bathrooms)} />
                      <InlineDetail label="Salons" value={String(property.livingRooms)} />
                      <InlineDetail label="Cuisine" value={property.equippedKitchen ? "Equipee" : "Standard"} />
                      <InlineDetail label="Meuble" value={property.meuble ? "Oui" : "Non"} />
                      <InlineDetail label="Caution" value={`${property.deposit} DT`} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {!isLoading && filteredProperties.length === 0 ? (
          <Card className="border-none bg-card p-8 shadow-xl">
            <p className="text-sm font-bold text-foreground">Aucune propriete trouvee.</p>
            <p className="mt-1 text-sm text-muted-foreground">Essayez un autre filtre ou recherchez un autre bien.</p>
          </Card>
        ) : null}
      </div>

      {selectedProperty ? (
        <div className="fixed inset-0 z-50 bg-black/65">
          <div className="h-screen w-screen overflow-hidden bg-background shadow-2xl">
            <div className="relative grid h-full lg:grid-cols-[1.05fr_0.95fr]">
              <button
                onClick={closeProperty}
                className="absolute right-6 top-6 z-20 rounded-full bg-black/25 p-3 text-white shadow-lg transition hover:bg-black/45"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex h-full min-h-0 flex-col bg-slate-950 p-5 text-white lg:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/55">Property Review Workspace</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">{selectedProperty.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <Building className="h-4 w-4" />
                    {selectedProperty.type.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <MapPin className="h-4 w-4" />
                    {selectedProperty.city}
                  </span>
                  <span>{getStatusBadge(selectedProperty.validationStatus)}</span>
                </div>

                <div className="mt-4 flex-1 overflow-hidden rounded-[1.75rem] border border-white/10">
                  <img src={activeImage || selectedProperty.images.cover} alt={selectedProperty.title} className="h-full min-h-[320px] w-full object-cover lg:min-h-0" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {gallery.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(image)}
                      className={cn(
                        "overflow-hidden rounded-2xl border-2 transition-all",
                        activeImage === image ? "border-blue-400 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-white/40",
                      )}
                    >
                      <img src={image} alt={`Vue ${index + 1}`} className="h-16 w-full object-cover lg:h-20" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-full overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 lg:p-7">
                <div className="flex h-full min-h-0 flex-col space-y-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Dossier de moderation</p>
                    <h3 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">{selectedProperty.title}</h3>
                    <p className="mt-2 flex items-center gap-2 text-base font-medium text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      {selectedProperty.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-y border-border/50 py-5">
                    <MetricCard label="Loyer mensuel" value={`${selectedProperty.rent} DT`} tone="blue" />
                    <MetricCard label="Caution demandee" value={`${selectedProperty.deposit} DT`} tone="slate" />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Description complete</p>
                      <p className="mt-3 line-clamp-5 text-sm font-medium leading-relaxed text-foreground/80">{selectedProperty.description}</p>
                    </div>

                    <Card className="border border-border/60 bg-white/90 shadow-none">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                          <ClipboardList className="h-3.5 w-3.5 text-primary" />
                          Checklist de conformite
                        </div>
                        <div className="mt-3 space-y-2">
                          {reviewChecklist.map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 px-3 py-2.5">
                              <span className="text-sm font-semibold text-foreground">{item.label}</span>
                              <Badge className={cn("border-none font-bold", item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                                {item.ok ? "Valide" : "A verifier"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Fiche technique</p>
                    <div className="mt-3 grid gap-3 rounded-3xl border border-border/30 bg-muted/30 p-4 sm:grid-cols-2 xl:grid-cols-3">
                      {[
                        { label: "Surface", value: `${selectedProperty.surface} m2`, icon: Layers },
                        { label: "Chambres", value: String(selectedProperty.bedrooms), icon: Building },
                        { label: "Salles de bain", value: String(selectedProperty.bathrooms), icon: Building },
                        { label: "Salons", value: String(selectedProperty.livingRooms), icon: Sofa },
                        { label: "Cuisine", value: selectedProperty.equippedKitchen ? "Equipee" : "Standard", icon: Package },
                        { label: "Meuble", value: selectedProperty.meuble ? "Oui" : "Non", icon: Package },
                      ].map((feature) => (
                        <div key={feature.label} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                          <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                            <feature.icon className="h-3 w-3" />
                            {feature.label}
                          </p>
                          <p className="mt-2 text-sm font-black text-foreground">{feature.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Card className="border border-slate-200/80 bg-white/90 shadow-none">
                    <CardContent className="p-3.5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-black text-white shadow-sm">
                            {selectedProperty.ownerName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/80">Locateur declarant</p>
                            <h4 className="truncate text-lg font-black tracking-tight text-foreground">{selectedProperty.ownerName}</h4>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[340px]">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                            <div className="mt-1.5 flex items-center gap-2 text-sm font-bold text-foreground">
                              <Mail className="h-4 w-4 shrink-0 text-primary" />
                              <span className="truncate">{selectedProperty.ownerEmail}</span>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">Telephone</p>
                            <div className="mt-1.5 flex items-center gap-2 text-sm font-bold text-foreground">
                              <Phone className="h-4 w-4 shrink-0 text-primary" />
                              <span className="truncate">{selectedProperty.ownerPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-auto overflow-hidden border-none bg-slate-950 text-white shadow-xl">
                    <CardContent className="p-0">
                      <div className="border-b border-white/10 px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Decision panel</p>
                            <h4 className="mt-1.5 text-xl font-black">Valider ou refuser l'annonce</h4>
                            <p className="mt-1.5 text-sm font-medium text-white/65">
                              Finalisez la moderation avec un motif clair en cas de refus. Cette action pilote la visibilite du bien sur la plateforme.
                            </p>
                          </div>
                          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white/10 sm:flex">
                            <ChevronRight className="h-6 w-6 text-white/80" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 px-5 py-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <DecisionMetric label="Statut" value={selectedProperty.validationStatus === "approved" ? "Publiee" : selectedProperty.validationStatus === "rejected" ? "Refusee" : "En attente"} />
                          <DecisionMetric label="Photos" value={String(gallery.length)} />
                          <DecisionMetric label="Conformite" value={`${reviewChecklist.filter((item) => item.ok).length}/${reviewChecklist.length}`} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Motif de refus / note de moderation</label>
                          <textarea
                            className="min-h-[88px] w-full resize-none rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/35 focus:border-red-300/50 focus:bg-white/10"
                            placeholder="Ex: photos insuffisantes, description floue, adresse incoherente, prix non justifie..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                        </div>

                        {selectedProperty.validationStatus === "pending" ? (
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                              onClick={() => handleApprove(selectedProperty.id)}
                              disabled={updatingId === selectedProperty.id}
                              className="h-12 flex-1 rounded-2xl bg-emerald-500 font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-600"
                            >
                              <Check className="mr-3 h-5 w-5" />
                              {updatingId === selectedProperty.id ? "..." : "Approuver et publier"}
                            </Button>
                            <Button
                              onClick={() => handleReject(selectedProperty.id)}
                              disabled={!rejectionReason.trim() || updatingId === selectedProperty.id}
                              variant="outline"
                              className="h-12 flex-1 rounded-2xl border border-red-300/20 bg-red-500/10 font-black uppercase tracking-[0.12em] text-red-100 hover:bg-red-500/20"
                            >
                              <X className="mr-3 h-5 w-5" />
                              {updatingId === selectedProperty.id ? "..." : "Refuser avec motif"}
                            </Button>
                          </div>
                        ) : null}

                        {selectedProperty.validationStatus === "rejected" && selectedProperty.rejectionReason ? (
                          <div className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-200/70">Dernier motif enregistre</p>
                            <p className="mt-2 text-sm font-medium text-red-50">{selectedProperty.rejectionReason}</p>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2 text-[11px] font-medium text-white/45">
                          <ShieldCheck className="h-4 w-4" />
                          Les decisions sont appliquees immediatement au statut de moderation du bien.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MetaBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon
  label: string
  value: string
  accent: string
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
        <Icon className={cn("h-3.5 w-3.5", accent)} />
        {value}
      </p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "blue" | "slate"
}) {
  return (
    <div className={cn("rounded-3xl p-5", tone === "blue" ? "border border-blue-100 bg-blue-50/70" : "border border-slate-200 bg-white")}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-4xl font-black tracking-tight", tone === "blue" ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  )
}

function DecisionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  )
}

function InlineDetail({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white px-4 py-3", className)}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-foreground">{value}</p>
    </div>
  )
}
