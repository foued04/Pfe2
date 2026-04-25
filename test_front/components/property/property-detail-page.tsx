"use client"

import { useState } from "react"
import { AlertCircle, Bath, Bed, CheckCircle2, MapPin, Maximize, ChefHat, Car, Send, Sofa } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api/client"
import { useProperty } from "@/hooks/api/use-property"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageTransition } from "@/components/shared/page-transition"

export function PropertyDetailPage({ propertyId }: { propertyId: string }) {
  const { property, isLoading, error } = useProperty(propertyId)
  const { role, isAuthenticated } = useAuth()
  const [duration, setDuration] = useState("12 mois")
  const [message, setMessage] = useState("")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  const canSendRentalRequest = isAuthenticated && role === "tenant"

  const handleRentalRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequestSuccess(false)
    setRequestError(null)

    if (!canSendRentalRequest) {
      setRequestError("Connectez-vous avec un compte locataire pour envoyer une demande.")
      return
    }

    setIsSendingRequest(true)

    try {
      await apiFetch("/rental-requests", {
        auth: true,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: propertyId,
          duration,
          message: message.trim() || `Je souhaite louer ${property?.title || "ce logement"}.`,
        }),
      })

      setRequestSuccess(true)
      setMessage("")
      setIsRequestDialogOpen(false)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Impossible d'envoyer la demande.")
    } finally {
      setIsSendingRequest(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Skeleton className="aspect-[16/7] w-full rounded-3xl" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-28 w-full" />
        </div>
      </section>
    )
  }

  if (error || !property) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-destructive">{error || "Property not found"}</div>
  }

  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
          <div className="aspect-[16/7] overflow-hidden bg-muted">
            <img src={property.images.cover} alt={property.title} className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{property.type.toUpperCase()}</Badge>
                <Badge className="border-0 bg-emerald-100 text-emerald-800">{property.status}</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">{property.title}</h1>
              <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{property.address}, {property.city}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-lg">
              <div className="text-xs uppercase tracking-[0.2em] opacity-80">Loyer</div>
              <div className="mt-1 text-3xl font-black">{property.rent.toLocaleString("fr-TN")} TND</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Feature label="Surface" value={`${property.surface} m2`} icon={<Maximize className="h-4 w-4" />} />
            <Feature label="Chambres" value={`${property.bedrooms}`} icon={<Bed className="h-4 w-4" />} />
            <Feature label="Salles de bain" value={`${property.bathrooms}`} icon={<Bath className="h-4 w-4" />} />
            <Feature label="Cuisine" value={property.equippedKitchen ? "Equipee" : "Standard"} icon={<ChefHat className="h-4 w-4" />} />
            <Feature label="Parking" value={property.parking ? "Oui" : "Non"} icon={<Car className="h-4 w-4" />} />
            <Feature label="Meuble" value={property.meuble ? "Oui" : "Non"} icon={<Sofa className="h-4 w-4" />} />
          </div>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold">Description</h2>
              <p className="mt-4 leading-8 text-muted-foreground">{property.description}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="space-y-5 p-6">
              <div>
                <h2 className="text-xl font-bold">Demande de location</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Envoyez votre demande directement au proprietaire de ce logement.
                </p>
              </div>

              {requestSuccess && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  Votre demande a ete envoyee. Vous pouvez la suivre dans la page Requests.
                </div>
              )}

              {requestError && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {requestError}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  className="gap-2"
                  disabled={!canSendRentalRequest || property.status !== "available"}
                  onClick={() => {
                    setRequestSuccess(false)
                    setRequestError(null)
                    setIsRequestDialogOpen(true)
                  }}
                >
                  Envoyer une demande
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Envoyer une demande</DialogTitle>
              <DialogDescription>
                Choisissez la duree souhaitee et le message que le proprietaire verra.
              </DialogDescription>
            </DialogHeader>

            {requestError && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {requestError}
              </div>
            )}

            <form onSubmit={handleRentalRequest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Duree souhaitee</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 mois">3 mois</SelectItem>
                    <SelectItem value="6 mois">6 mois</SelectItem>
                    <SelectItem value="12 mois">12 mois</SelectItem>
                    <SelectItem value="24 mois">24 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Message pour le proprietaire</label>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ajoutez le message que le proprietaire verra..."
                  className="min-h-28 resize-none"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="gap-2" disabled={isSendingRequest || !canSendRentalRequest || property.status !== "available"}>
                  {isSendingRequest ? "Envoi..." : "Confirmer la demande"}
                  {!isSendingRequest && <Send className="h-4 w-4" />}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </PageTransition>
  )
}

function Feature({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
          <div className="text-base font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}
