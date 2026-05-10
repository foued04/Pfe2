"use client"

import { useEffect, useState } from "react"
import { ClipboardList, Loader2, MapPin, Search, User, Mail, Phone, Calendar, Wallet, Home } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type HousingNeed = {
  _id: string
  tenant: {
    _id: string
    fullName: string
    email: string
    phone?: string
  }
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
  updatedAt: string
}

export function AdminHousingNeedsPage() {
  const [needs, setNeeds] = useState<HousingNeed[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadNeeds = async () => {
      try {
        const data = await apiFetch<HousingNeed[]>("/housing-needs/all", { auth: true })
        setNeeds(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des besoins logement")
      } finally {
        setIsLoading(false)
      }
    }

    void loadNeeds()
  }, [])

  const filteredNeeds = needs.filter((need) => {
    const searchStr = `${need.tenant.fullName} ${need.desiredCity} ${need.department || ""}`.toLowerCase()
    return searchStr.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Besoins Logement</h1>
          <p className="text-muted-foreground">Consultez les demandes de logement soumises par les locataires.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par locataire, ville ou delegation..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reessayer
          </Button>
        </div>
      ) : filteredNeeds.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-semibold">Aucun besoin trouve</h3>
          <p className="text-muted-foreground">Aucune demande ne correspond a votre recherche.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredNeeds.map((need) => (
            <Card key={need._id} className="overflow-hidden border-primary/10 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{need.tenant.fullName}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {need.tenant.email}
                        </span>
                        {need.tenant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {need.tenant.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit bg-background">
                    Soumis le {new Date(need.updatedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Localisation</span>
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    {need.desiredCity}
                    {need.department && <span className="text-muted-foreground text-sm">({need.department})</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget & Type</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Wallet className="h-4 w-4 text-primary" />
                      {need.minBudget || 0} - {need.maxBudget || 'Illimite'} TND
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="h-3.5 w-3.5" />
                      {need.propertyType?.toUpperCase() || 'Tous types'} • {need.bedrooms || 'Peu importe'} chambres
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disponibilite</span>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-primary" />
                    {need.moveInDate ? new Date(need.moveInDate).toLocaleDateString() : 'Immediat'}
                    <span className="text-muted-foreground text-sm">({need.duration || 'Non precise'})</span>
                  </div>
                </div>

                {need.notes && (
                  <div className="col-span-full space-y-2 rounded-xl bg-muted/30 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes detaillees</span>
                    <p className="text-sm italic text-muted-foreground">"{need.notes}"</p>
                  </div>
                )}

                <div className="col-span-full flex flex-wrap gap-2 pt-2">
                  {need.meuble && <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Meuble</Badge>}
                  {need.parking && <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50">Parking</Badge>}
                  {need.nearCenter && <Badge variant="secondary" className="rounded-full bg-purple-50 text-purple-700 hover:bg-purple-50">Proche centre</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
