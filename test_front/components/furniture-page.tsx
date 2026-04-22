"use client"

import Link from "next/link"
import {
  ArrowRight,
  Bed,
  Check,
  CookingPot,
  Monitor,
  Sofa,
  Sparkles,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageTransition } from "@/components/shared/page-transition"

const categories = [
  {
    title: "Salon",
    description: "Canapes, tables basses et compositions elegantes pour creer un espace de vie confortable et accueillant.",
    icon: Sofa,
  },
  {
    title: "Chambre",
    description: "Lits, rangements et meubles fonctionnels penses pour allier repos, style et optimisation de l'espace.",
    icon: Bed,
  },
  {
    title: "Cuisine",
    description: "Meubles et solutions pratiques pour organiser la cuisine avec efficacite et sobriete.",
    icon: CookingPot,
  },
  {
    title: "Bureau",
    description: "Postes de travail, rangements et mobilier adaptes a un environnement productif et soigne.",
    icon: Monitor,
  },
]

const furnitureExamples = [
  {
    title: "Canape Ligna",
    category: "Salon",
    price: "A partir de 1 450 TND",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=700&fit=crop",
    description: "Un canape aux lignes epurees, concu pour structurer le salon avec confort et discretion.",
  },
  {
    title: "Lit Atelier avec tete capitonnee",
    category: "Chambre",
    price: "A partir de 1 980 TND",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=700&fit=crop&sat=-20",
    description: "Une piece sobre et enveloppante, ideale pour creer une chambre harmonieuse et reposante.",
  },
  {
    title: "Table repas Orme",
    category: "Cuisine",
    price: "A partir de 890 TND",
    image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=900&h=700&fit=crop",
    description: "Une table de repas fonctionnelle et elegante, adaptee aux cuisines ouvertes comme aux espaces compacts.",
  },
  {
    title: "Bureau Cadre",
    category: "Bureau",
    price: "A partir de 760 TND",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=700&fit=crop",
    description: "Un bureau sobre avec rangements integres pour travailler dans un cadre ordonne et raffine.",
  },
]

const highlights = [
  "Selection de meubles adaptee aux appartements, maisons et residences locatives",
  "Lignes sobres, finitions soignees et compositions faciles a integrer",
  "Accompagnement pour amenager chaque piece avec coherence",
]

export function FurniturePage() {
  return (
    <PageTransition>
      <section className="bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_40%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.7),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#ffffff_62%)] shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-10 p-8 md:p-10 xl:grid-cols-[1.15fr_0.85fr] xl:p-14">
              <div className="space-y-8">
                <div className="space-y-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Collection meuble
                  </span>
                  <div className="space-y-4">
                    <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl md:leading-[1.02]">
                      Du mobilier soigne pour amenager des interieurs clairs, elegants et fonctionnels.
                    </h1>
                    <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                      ImmoSmart vous propose une selection de meubles pensee pour le salon, la chambre, la cuisine et le bureau. Chaque categorie reunit des pieces utiles, bien dessinees et adaptees a un usage quotidien, en residence principale comme en location meublee.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-7">
                    <Link href="/login">
                      Commencer mon projet
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                    <Link href="#categories">Voir les categories</Link>
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item} className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map(({ title, description, icon: Icon }) => (
                  <Card key={title} className="rounded-[2rem] border-slate-200/80 bg-white/88 shadow-none">
                    <CardContent className="p-7">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-slate-100 text-primary">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
                      <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div id="categories" className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="overflow-hidden rounded-[2rem] border-slate-200/80 bg-white/90 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=900&fit=crop"
                  alt="Interieur meuble"
                  className="h-full w-full object-cover"
                />
              </div>
            </Card>

            <Card className="rounded-[2rem] border-slate-200/80 bg-white/90 shadow-sm">
              <CardContent className="p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Notre approche</div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  Des collections pensees pour durer et s'integrer naturellement a votre interieur.
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 md:text-base">
                  <p>
                    Nous privilegions un mobilier facile a vivre, avec des formes nettes, des proportions equilibrees et des finitions qui traversent le temps.
                  </p>
                  <p>
                    L'objectif n'est pas d'accumuler des pieces, mais de composer des espaces coherents, confortables et credibles, qu'il s'agisse d'un logement personnel ou d'un bien destine a la location.
                  </p>
                  <p>
                    Chaque categorie a ete pensee pour repondre a un besoin concret: recevoir, dormir, cuisiner, travailler.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/properties">Decouvrir les proprietes</Link>
                  </Button>
                  <Button asChild variant="link" className="px-0 text-base">
                    <Link href="/register">Demander un accompagnement</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Selection
              </span>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                Quelques pieces pour illustrer nos collections
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                Une selection representative pour visualiser le niveau de finition, l'esprit des lignes et les usages vises sur la page meuble.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {furnitureExamples.map((item) => (
                <Card key={item.title} className="group overflow-hidden rounded-[1.9rem] border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                      {item.category}
                    </div>
                  </div>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-950">{item.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prix indicatif</div>
                        <div className="mt-1 text-lg font-black text-primary">{item.price}</div>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Selection
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
