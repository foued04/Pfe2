"use client"

import { useMemo, useState } from "react"
import type { ElementType } from "react"
import { Building2, Search } from "lucide-react"
import { useProperties } from "@/hooks/api/use-properties"
import { PropertyCard } from "@/components/property/property-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PageTransition } from "@/components/shared/page-transition"

interface PropertiesListPageProps {
  headingTag?: ElementType
}

export function PropertiesListPage({ headingTag: Heading = "h1" }: PropertiesListPageProps) {
  const { properties, isLoading, error } = useProperties()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const haystack = `${property.title} ${property.city} ${property.address}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
    })
  }, [properties, query])

  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Catalogue
          </span>
          <Heading className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">Explorez les proprietes disponibles</Heading>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base md:text-lg">
            Une experience de recherche claire, structuree comme une vraie application SaaS, avec des pages dediees et une navigation stable.
          </p>
        </div>

        <Card className="mt-8 border-border/70 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher par titre, ville ou adresse" className="pl-10" />
          </div>
        </Card>

        {isLoading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 grid min-h-72 place-items-center rounded-3xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <div>
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold">Aucune propriete trouvee</h2>
              <p className="mt-2 text-sm text-muted-foreground">Essayez un autre mot-cle ou ajustez votre recherche.</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  )
}
