import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  arrowForwardOutline,
  callOutline,
  closeOutline,
  homeOutline,
  locationOutline,
  mailOutline,
  menuOutline,
  searchOutline,
  timeOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { fetchProperties } from "../lib/property-api"
import type { BackendProperty } from "../types/api"
import "./Tab1.css"

const contactCards = [
  { icon: callOutline, title: "Téléphone", value: "+216 73 461 000" },
  { icon: mailOutline, title: "Email", value: "contact@immosmart.tn" },
  { icon: locationOutline, title: "Localisation", value: "Monastir, Tunisie" },
  { icon: timeOutline, title: "Disponibilité", value: "Lundi - Samedi, 8h00 - 18h00" },
]

const statusLabels: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "Maintenance",
}

const DashboardPath = (role?: string) => {
  if (role === "admin") return "/account"
  if (role === "owner" || role === "tenant") return "/tab3"
  return "/tab3"
}

const Tab1: React.FC = () => {
  const history = useHistory()
  const { isAuthenticated, user, token } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [properties, setProperties] = useState<BackendProperty[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const loadProperties = async () => {
      setLoading(true)
      try {
        setError("")
        const data = await fetchProperties(token || undefined)
        if (!active) return

        const approvedProperties = (Array.isArray(data) ? data : []).filter(
          (property) => property.moderationStatus === "approved"
        )
        setProperties(approvedProperties)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Impossible de charger les propriétés.")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProperties()

    return () => {
      active = false
    }
  }, [token])

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase()
    return properties.filter((property) => {
      const haystack = `${property.title} ${property.city} ${property.address}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [properties, search])

  const dashboardHref = DashboardPath(user?.role)

  const navItems = [
    { label: "Accueil", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Biens", action: () => history.push("/tab2") },
    { label: "Meubles", action: () => history.push("/furniture") },
    { label: "Contact", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
  ]

  const handleNavigate = (action: () => void) => {
    setIsMenuOpen(false)
    action()
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content home-page-content">
        <div className="home-page-shell">
          <header className="home-public-header">
            <div className="home-public-header-inner">
              <button type="button" className="home-brand-button" onClick={() => history.push("/")}>
                <span className="home-brand-icon">
                  <IonIcon icon={homeOutline} />
                </span>
                <span className="home-brand-copy">
                  <strong>ImmoSmart</strong>
                </span>
              </button>

              <nav className="home-public-nav desktop-only">
                {navItems.map((item) => (
                  <button key={item.label} type="button" className="home-nav-link" onClick={item.action}>
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="home-public-actions desktop-only">
                {isAuthenticated ? (
                  <>
                    <button type="button" className="home-action-button home-outline-button" onClick={() => history.push(dashboardHref)}>
                      Tableau de bord
                    </button>
                    <button type="button" className="home-action-button home-primary-button" onClick={() => history.push("/account")}>
                      Compte
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="home-action-button home-outline-button" onClick={() => history.push("/login")}>
                      Connexion
                    </button>
                    <button type="button" className="home-action-button home-primary-button" onClick={() => history.push("/register")}>
                      Inscription
                    </button>
                  </>
                )}
              </div>

              <button type="button" className="home-menu-button mobile-only" onClick={() => setIsMenuOpen(true)} aria-label="Ouvrir la navigation">
                <IonIcon icon={menuOutline} />
              </button>
            </div>
          </header>

          {isMenuOpen ? (
            <div className="home-mobile-menu-backdrop" role="presentation" onClick={() => setIsMenuOpen(false)}>
              <aside className="home-mobile-menu" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="home-mobile-menu-header">
                  <h2>Navigation</h2>
                  <button type="button" className="home-mobile-close" onClick={() => setIsMenuOpen(false)} aria-label="Fermer la navigation">
                    <IonIcon icon={closeOutline} />
                  </button>
                </div>

                <div className="home-mobile-menu-links">
                  {navItems.map((item) => (
                    <button key={item.label} type="button" className="home-mobile-nav-link" onClick={() => handleNavigate(item.action)}>
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="home-mobile-menu-actions">
                  {isAuthenticated ? (
                    <>
                      <button type="button" className="home-action-button home-outline-button" onClick={() => handleNavigate(() => history.push(dashboardHref))}>
                        Tableau de bord
                      </button>
                      <button type="button" className="home-action-button home-primary-button" onClick={() => handleNavigate(() => history.push("/account"))}>
                        Compte
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="home-action-button home-outline-button" onClick={() => handleNavigate(() => history.push("/login"))}>
                        Connexion
                      </button>
                      <button type="button" className="home-action-button home-primary-button" onClick={() => handleNavigate(() => history.push("/register"))}>
                        Inscription
                      </button>
                    </>
                  )}
                </div>
              </aside>
            </div>
          ) : null}

          <main className="home-public-main">
            <section id="accueil" className="home-hero-section">
              <div className="home-hero-copy">
                <h1>La plateforme immobilière nouvelle génération, fluide et intuitive.</h1>
                <p>
                  ImmoSmart connecte locataires, locateurs et administrateurs au sein d&apos;une expérience moderne et simplifiée pour une gestion optimale de votre patrimoine immobilier.
                </p>
                <div className="home-hero-actions">
                  <button type="button" className="home-action-button home-primary-button" onClick={() => history.push("/tab2")}>
                    Explorer les propriétés
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                  <button type="button" className="home-action-button home-outline-button" onClick={() => history.push("/furniture")}>
                    Voir les meubles
                  </button>
                </div>
              </div>

              <div className="home-hero-visual">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop"
                  alt="ImmoSmart hero"
                />
              </div>
            </section>

            <section id="properties" className="home-properties-section">
              <div className="home-section-heading">
                <span className="home-section-pill">Catalogue</span>
                <h2>Explorez les propriétés disponibles</h2>
                <p>
                  Une expérience de recherche claire, structurée comme une vraie application SaaS, avec des pages
                  dédiées et une navigation stable.
                </p>
              </div>

              <div className="home-search-card">
                <IonIcon icon={searchOutline} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher par titre, ville ou adresse"
                />
              </div>

              {loading ? (
                <div className="home-feedback-card">Chargement des propriétés approuvées...</div>
              ) : error ? (
                <div className="home-feedback-card home-error-card">{error}</div>
              ) : filteredProperties.length === 0 ? (
                <div className="home-feedback-card">Aucune propriété trouvée. Essayez un autre mot-clé.</div>
              ) : (
                <div className="home-properties-grid">
                  {filteredProperties.map((property) => (
                    <button
                      key={property._id}
                      type="button"
                      className="home-property-card"
                      onClick={() => history.push(`/property/${property._id}`)}
                    >
                      <div className="home-property-media">
                        <img
                          src={
                            property.images?.cover ||
                            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=900&fit=crop"
                          }
                          alt={property.title}
                        />
                        <span className="home-property-status">
                          {statusLabels[property.status] || property.status}
                        </span>
                      </div>

                      <div className="home-property-body">
                        <h3>{property.title}</h3>
                        <p className="home-property-address">{property.address}</p>
                        <div className="home-property-meta">
                          <span>{property.surface} m2</span>
                          <span>{property.bedrooms} ch.</span>
                          <span>{property.bathrooms} sdb</span>
                        </div>
                        <strong>{property.rent.toLocaleString("fr-TN")} DT / mois</strong>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section id="contact" className="home-contact-section">
              <div className="home-section-heading">
                <span className="home-section-pill">Contact</span>
                <h2>Parlons de votre projet immobilier</h2>
                <p>
                  Contactez l&apos;équipe ImmoSmart pour l&apos;accompagnement produit, la publication de biens, l&apos;ameublement
                  et toute question liée à la plateforme.
                </p>
              </div>

              <div className="home-contact-grid">
                {contactCards.map((card) => (
                  <article key={card.title} className="home-contact-card">
                    <div className="home-contact-icon">
                      <IonIcon icon={card.icon} />
                    </div>
                    <div className="home-contact-label">{card.title}</div>
                    <div className="home-contact-value">{card.value}</div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <footer className="home-public-footer">
            <div className="home-footer-grid">
              <div>
                <div className="home-footer-brand">
                  <span className="home-brand-icon">
                    <IonIcon icon={homeOutline} />
                  </span>
                  <h3>ImmoSmart</h3>
                </div>
                <p>
                  Une plateforme SaaS immobilière moderne pour rechercher, gérer et suivre le cycle de location entre
                  locataires, locateurs et administrateurs.
                </p>
              </div>

              <div>
                <h4>Navigation</h4>
                <div className="home-footer-links">
                  <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Accueil
                  </button>
                  <button type="button" onClick={() => history.push("/tab2")}>
                    Biens
                  </button>
                  <button type="button" onClick={() => history.push("/furniture")}>
                    Meubles
                  </button>
                  <button type="button" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                    Contact
                  </button>
                </div>
              </div>

              <div>
                <h4>Contact</h4>
                <div className="home-footer-contact">
                  <div><IonIcon icon={callOutline} /> +216 73 461 000</div>
                  <div><IonIcon icon={mailOutline} /> contact@immosmart.tn</div>
                  <div><IonIcon icon={locationOutline} /> Monastir, Tunisie</div>
                </div>
              </div>
            </div>

            <div className="home-footer-bottom">© 2026 ImmoSmart. Tous droits réservés.</div>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Tab1
