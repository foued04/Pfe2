import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-xl font-black text-foreground">ImmoSmart</h3>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            Une plateforme SaaS immobiliere moderne pour rechercher, gerer et suivre le cycle de location entre locataires, proprietaires et administrateurs.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Navigation</h4>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/" className="text-sm text-foreground hover:text-primary">Accueil</Link>
            <Link href="/properties" className="text-sm text-foreground hover:text-primary">Properties</Link>
            <Link href="/ameublement" className="text-sm text-foreground hover:text-primary">Meubles</Link>
            <Link href="/contact" className="text-sm text-foreground hover:text-primary">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-foreground">
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +216 73 461 000</div>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> contact@immosmart.tn</div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Monastir, Tunisie</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
