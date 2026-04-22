"use client"

import { Bath, Bed, MapPin, Maximize, Phone, Mail, ChefHat, Car, Sofa } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProperty } from "@/hooks/api/use-property"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/shared/page-transition"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

export function PropertyDetailPage({ propertyId }: { propertyId: string }) {
  const { property, isLoading, error } = useProperty(propertyId)
  const router = useRouter()
  const { role, isAuthenticated } = useAuth()
  const canViewOwnerContact = role === "owner" || role === "admin"

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous ou recevez un code pour continuer votre demande.",
      })
      const title = encodeURIComponent(property?.title || "")
      router.push(`/request-access?propertyTitle=${title}&redirect=${encodeURIComponent(`/property/${propertyId}`)}`)
      return
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Skeleton className="aspect-[16/7] w-full rounded-3xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-72 w-full rounded-3xl" />
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-8">
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
          </div>

          <Card className="h-fit rounded-3xl border-border/70">
            <CardContent className="space-y-6 p-6">
              <div>
                <h2 className="text-xl font-bold">Contacter le proprietaire</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {canViewOwnerContact
                    ? "Retrouvez les informations de contact et passez a l'etape suivante."
                    : "Les coordonnees du proprietaire restent privees. Utilisez la demande pour poursuivre le processus."}
                </p>
              </div>
              <div className="space-y-4 rounded-2xl bg-muted/50 p-4">
                <div className="font-semibold">{property.ownerName}</div>
                {canViewOwnerContact ? (
                  <>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-primary" /> {property.ownerEmail}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground"><Phone className="h-4 w-4 text-primary" /> {property.ownerPhone}</div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Les informations directes de contact ne sont pas affichees pour les utilisateurs standards.
                  </div>
                )}
              </div>
              <Button className="w-full rounded-xl" onClick={handleRequestClick}>
                Envoyer une demande
              </Button>
            </CardContent>
          </Card>
        </div>
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
