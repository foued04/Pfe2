import Link from "next/link"
import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react"
import { PropertiesListPage } from "@/components/property/properties-list-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const contactCards = [
  { icon: Phone, title: "Telephone", value: "+216 73 461 000" },
  { icon: Mail, title: "Email", value: "contact@immosmart.tn" },
  { icon: MapPin, title: "Localisation", value: "Monastir, Tunisie" },
  { icon: Clock3, title: "Disponibilite", value: "Lundi - Samedi, 8h00 - 18h00" },
]

export default function HomeRoute() {
  return (
    <div>
      <section id="accueil" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div className="space-y-6">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Une plateforme immobiliere claire, routee comme une vraie app.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            ImmoSmart connecte locataires, proprietaires et administrateurs dans une experience moderne avec navigation reelle, dashboards dedies et modules metier unifies.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/#properties">Explorer les proprietes <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/ameublement">Voir les meubles</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop"
            alt="ImmoSmart hero"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <div id="properties" className="scroll-mt-28">
        <PropertiesListPage headingTag="h2" />
      </div>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-10 md:px-6 md:py-14">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Contact
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Parlons de votre projet immobilier</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Contactez l'equipe ImmoSmart pour l'accompagnement produit, la publication de biens, l'ameublement et toute question liee a la plateforme.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {contactCards.map(({ icon: Icon, title, value }) => (
            <Card key={title} className="rounded-3xl border-border/70">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
                <div className="mt-3 text-lg font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
