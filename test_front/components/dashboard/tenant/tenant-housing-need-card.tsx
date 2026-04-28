"use client"

import { useEffect, useMemo, useState } from "react"
import { BellRing, CheckCircle2, ClipboardList, Home, Loader2, MapPin, PencilLine, Send } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type HousingNeed = {
  _id?: string
  desiredCity: string
  department?: string
  minBudget?: number
  maxBudget?: number
  propertyType?: string
  bedrooms?: string
  moveInDate?: string
  duration?: string
  meuble?: boolean
  parking?: boolean
  nearCenter?: boolean
  notes?: string
  updatedAt?: string
}

type HousingNeedResponse = {
  need: HousingNeed
  matchesCount: number
  notifiedMatches: number
  message: string
}

const propertyTypes = [
  { value: "s0", label: "S+0" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const bedroomOptions = [
  { value: "1", label: "1 chambre" },
  { value: "2", label: "2 chambres" },
  { value: "3", label: "3 chambres" },
  { value: "4+", label: "4+ chambres" },
]

const durationOptions = [
  { value: "6", label: "6 mois" },
  { value: "12", label: "1 an" },
  { value: "24", label: "2 ans" },
  { value: "36+", label: "3 ans ou plus" },
]

const emptyForm = {
  desiredCity: "",
  department: "",
  minBudget: "",
  maxBudget: "",
  propertyType: "",
  bedrooms: "",
  moveInDate: "",
  duration: "",
  meuble: false,
  parking: false,
  nearCenter: false,
  notes: "",
}

export function TenantHousingNeedCard({
  defaultOpen = false,
  hideToggleButton = false,
}: {
  defaultOpen?: boolean
  hideToggleButton?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [matchesCount, setMatchesCount] = useState(0)
  const [need, setNeed] = useState<HousingNeed | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    let active = true

    const loadNeed = async () => {
      try {
        const data = await apiFetch<HousingNeed | null>("/housing-needs/me", { auth: true })
        if (!active) return

        setNeed(data)
        if (data) {
          setFormData({
            desiredCity: data.desiredCity || "",
            department: data.department || "",
            minBudget: data.minBudget?.toString() || "",
            maxBudget: data.maxBudget?.toString() || "",
            propertyType: data.propertyType || "",
            bedrooms: data.bedrooms || "",
            moveInDate: data.moveInDate || "",
            duration: data.duration || "",
            meuble: Boolean(data.meuble),
            parking: Boolean(data.parking),
            nearCenter: Boolean(data.nearCenter),
            notes: data.notes || "",
          })
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Impossible de charger votre besoin logement.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadNeed()

    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => {
    if (!need) return []

    return [
      need.desiredCity ? `Ville: ${need.desiredCity}` : null,
      need.maxBudget ? `Budget max: ${need.maxBudget} TND` : null,
      need.propertyType ? `Type: ${need.propertyType.toUpperCase()}` : null,
      need.bedrooms ? `Chambres: ${need.bedrooms}` : null,
      need.meuble ? "Meuble" : null,
      need.parking ? "Parking" : null,
    ].filter(Boolean) as string[]
  }, [need])

  const updateField = (field: keyof typeof emptyForm, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ ...emptyForm })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiFetch<HousingNeedResponse>("/housing-needs/me", {
        method: "POST",
        auth: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          minBudget: formData.minBudget,
          maxBudget: formData.maxBudget,
        }),
      })

      setNeed(response.need)
      setMatchesCount(response.matchesCount)
      setSuccess(response.message)
      resetForm()
      setIsOpen(hideToggleButton)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer votre besoin logement.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-3xl border-primary/10 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Besoin logement</CardTitle>
              <CardDescription>
                Decrivez le logement recherche. Vous recevrez une notification quand un bien correspondant sera disponible.
              </CardDescription>
            </div>
          </div>
        </div>
        {!hideToggleButton ? (
          <Button type="button" className="gap-2 self-start md:self-auto" onClick={() => setIsOpen((current) => !current)}>
            {need ? <PencilLine className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
            Besoin logement
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement de votre besoin logement...
          </div>
        ) : null}

        {!isLoading && need ? (
          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Besoin enregistre
                </div>
                <div className="flex flex-wrap gap-2">
                  {summary.map((item) => (
                    <span key={item} className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
                {need.notes ? <p className="text-sm text-muted-foreground">{need.notes}</p> : null}
              </div>
              <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <BellRing className="h-4 w-4" />
                  Alertes actives
                </div>
                <p className="mt-1 text-muted-foreground">
                  {matchesCount > 0 ? `${matchesCount} logement(s) correspondant(s) detecte(s).` : "Nous surveillons les nouveaux logements pour vous."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {success ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        {isOpen ? (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border/70 bg-background p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="need-city">Ville souhaitee</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="need-city"
                    value={formData.desiredCity}
                    onChange={(event) => updateField("desiredCity", event.target.value)}
                    className="pl-10"
                    placeholder="Tunis, Sousse, Monastir..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="need-department">Quartier / zone</Label>
                <Input
                  id="need-department"
                  value={formData.department}
                  onChange={(event) => updateField("department", event.target.value)}
                  placeholder="Lac 2, La Marsa, Centre ville..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="need-min-budget">Budget minimum</Label>
                <Input
                  id="need-min-budget"
                  type="number"
                  min="0"
                  value={formData.minBudget}
                  onChange={(event) => updateField("minBudget", event.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="need-max-budget">Budget maximum</Label>
                <Input
                  id="need-max-budget"
                  type="number"
                  min="0"
                  value={formData.maxBudget}
                  onChange={(event) => updateField("maxBudget", event.target.value)}
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <Label>Type de logement</Label>
                <Select value={formData.propertyType} onValueChange={(value) => updateField("propertyType", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre de chambres</Label>
                <Select value={formData.bedrooms} onValueChange={(value) => updateField("bedrooms", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="need-move-in">Date d'entree souhaitee</Label>
                <Input
                  id="need-move-in"
                  type="date"
                  value={formData.moveInDate}
                  onChange={(event) => updateField("moveInDate", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duree souhaitee</Label>
                <Select value={formData.duration} onValueChange={(value) => updateField("duration", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Non precisee" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-3">
              <label className="flex items-center justify-between gap-3 text-sm font-medium">
                Meuble
                <Switch checked={formData.meuble} onCheckedChange={(checked) => updateField("meuble", checked)} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-medium">
                Parking
                <Switch checked={formData.parking} onCheckedChange={(checked) => updateField("parking", checked)} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-medium">
                Pres du centre
                <Switch checked={formData.nearCenter} onCheckedChange={(checked) => updateField("nearCenter", checked)} />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="need-notes">Besoin detaille</Label>
              <Textarea
                id="need-notes"
                value={formData.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={5}
                placeholder="Expliquez exactement ce que vous cherchez: balcon, residence calme, proche universite, etc."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsOpen(false)
                }}
              >
                Fermer
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? "Enregistrement..." : "Enregistrer mon besoin"}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
