import { Card, CardContent } from "@/components/ui/card"

export default function ContactRoute() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="max-w-2xl">
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Contact
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Parlons de votre projet immobilier</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Contactez l’equipe ImmoSmart pour l’accompagnement produit, la publication de biens ou toute question liee a la plateforme.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ["Telephone", "+216 73 461 000"],
          ["Email", "contact@immosmart.tn"],
          ["Localisation", "Monastir, Tunisie"],
        ].map(([title, value]) => (
          <Card key={title} className="rounded-3xl">
            <CardContent className="p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
              <div className="mt-3 text-lg font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

