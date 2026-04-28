import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  homeOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  chatbubbleOutline,
  searchOutline,
  sparklesOutline,
  eyeOutline,
  checkmarkCircleOutline,
  bedOutline,
  restaurantOutline,
  desktopOutline,
  businessOutline,
  bulbOutline,
  callOutline,
  mailOutline,
  locationOutline,
  logoFacebook,
  logoInstagram,
  logoLinkedin,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import "./Tab1.css"

const Tab1: React.FC = () => {
  const history = useHistory()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const heroImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=900&fit=crop",
    ],
    [],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [heroImages.length])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content web-home-content">
        <div className="web-homepage">
          <nav className="web-home-nav">
            <div className="web-home-brand">
              <div className="web-home-logo-box">
                <img src="/brand-logo.svg" alt="ImmoSmart logo" className="web-home-logo-image" />
              </div>
              <span>ImmoSmart</span>
            </div>

            <div className="web-home-links">
              <button type="button" onClick={() => scrollToSection("top")}>
                Accueil
              </button>
              <button type="button" onClick={() => history.push("/tab2")}>
                Proprietes
              </button>
              <button type="button" onClick={() => scrollToSection("furniture-section")}>
                Ameublement
              </button>
              <button type="button" onClick={() => scrollToSection("contact-section")}>
                Contact
              </button>
              <div className="web-home-divider" />
              <button type="button" onClick={() => history.push("/tab3")}>
                Connexion
              </button>
              <button type="button" className="web-home-signup" onClick={() => history.push("/tab3")}>
                S'inscrire
              </button>
            </div>
          </nav>

          <section className="web-home-hero">
            <div id="top" />
            <div className="web-home-bg-circle web-home-bg-circle-right" />
            <div className="web-home-bg-circle web-home-bg-circle-left" />

            <div className="web-home-hero-inner">
              <div className="web-home-hero-copy">
                <h1>
                  Trouvez votre bien <span>ideal</span> a Monastir
                </h1>
                <p>
                  Appartements, villas, studios et locaux commerciaux - meubles ou non meubles. Une experience
                  immobiliere moderne et transparente.
                </p>

                <div className="web-home-actions">
                  <button type="button" className="web-home-primary" onClick={() => history.push("/tab2")}>
                    Voir les annonces
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                  <button type="button" className="web-home-outline" onClick={() => scrollToSection("furniture-section")}>
                    Decouvrir l'ameublement
                  </button>
                </div>

                <div className="web-home-stats">
                  <div>
                    <strong>150+</strong>
                    <small>Biens</small>
                  </div>
                  <div>
                    <strong>98%</strong>
                    <small>Satisfaction</small>
                  </div>
                  <div>
                    <strong>24h</strong>
                    <small>Reponse</small>
                  </div>
                </div>
              </div>

              <div className="web-home-hero-image-wrap">
                <div className="web-home-hero-image">
                  {heroImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Immobilier ${index + 1}`}
                      style={{ opacity: currentImageIndex === index ? 1 : 0 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="web-section web-concept-section">
            <div className="web-section-inner">
              <div className="web-section-title">
                <span>Notre concept</span>
                <h2>Une experience immobiliere moderne</h2>
                <p>
                  ImmoSmart reinvente la recherche de logement a Monastir avec une plateforme digitale, transparente et
                  simple d'utilisation.
                </p>
              </div>

              <div className="web-feature-grid">
                {[
                  {
                    icon: shieldCheckmarkOutline,
                    title: "Annonces verifiees",
                    text: "Chaque bien est verifie par notre equipe pour garantir la fiabilite des informations et la qualite du logement.",
                  },
                  {
                    icon: chatbubbleOutline,
                    title: "Contact direct",
                    text: "Echangez directement avec les proprietaires sans intermediaire. Communication fluide et transparente.",
                  },
                  {
                    icon: searchOutline,
                    title: "Recherche intelligente",
                    text: "Filtrez par type, surface, budget et localisation pour trouver le bien qui correspond exactement a vos besoins.",
                  },
                  {
                    icon: homeOutline,
                    title: "Ameublement integre",
                    text: "Bien non meuble ? Consultez notre catalogue de meubles et equipez votre logement en quelques clics.",
                  },
                  {
                    icon: sparklesOutline,
                    title: "Solution digitale",
                    text: "Gestion des contrats, paiements et maintenance - tout est centralise sur une seule plateforme moderne.",
                  },
                  {
                    icon: eyeOutline,
                    title: "Confiance & clarte",
                    text: "Photos reelles, descriptions detaillees, avis verifies. Prenez vos decisions en toute serenite.",
                  },
                ].map((feature) => (
                  <article key={feature.title} className="web-feature-card">
                    <div className="web-feature-icon">
                      <IonIcon icon={feature.icon} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="web-section web-highlight-section">
            <div className="web-section-inner web-highlight-grid">
              <div className="web-highlight-image">
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&h=900&fit=crop"
                  alt="Selection du mois"
                />
                <div className="web-highlight-overlay" />
                <div className="web-highlight-caption">
                  <small>Selection du mois</small>
                  <strong>Villa contemporaine - Kantaoui</strong>
                </div>
              </div>

              <div className="web-highlight-copy">
                <span className="web-pill">Mise en avant</span>
                <h2>Des biens d'exception selectionnes pour vous</h2>
                <p>
                  Decouvrez notre selection premium de proprietes a Monastir. Chaque bien est soigneusement choisi pour
                  son emplacement, sa qualite et son rapport qualite-prix exceptionnel.
                </p>
                <ul>
                  <li>
                    <IonIcon icon={checkmarkCircleOutline} />
                    Emplacements strategiques dans les meilleurs quartiers
                  </li>
                  <li>
                    <IonIcon icon={checkmarkCircleOutline} />
                    Finitions haut de gamme et espaces lumineux
                  </li>
                  <li>
                    <IonIcon icon={checkmarkCircleOutline} />
                    Proximite des commodites et transports
                  </li>
                </ul>
                <button type="button" className="web-home-primary" onClick={() => history.push("/tab2")}>
                  Explorer les biens
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </div>
            </div>
          </section>

          <section id="furniture-section" className="web-section web-furniture-section">
            <div className="web-section-inner">
              <div className="web-section-title">
                <span>Ameublement</span>
                <h2>Bien non meuble ? Nous avons la solution</h2>
                <p>
                  ImmoSmart vous permet de consulter et commander des meubles et equipements pour completer votre
                  logement. Un service unique integre a votre location.
                </p>
              </div>

              <div className="web-furniture-grid">
                {[
                  {
                    icon: homeOutline,
                    title: "Salon",
                    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&h=500&fit=crop",
                  },
                  {
                    icon: bedOutline,
                    title: "Chambre",
                    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&h=500&fit=crop",
                  },
                  {
                    icon: restaurantOutline,
                    title: "Cuisine",
                    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=500&fit=crop",
                  },
                  {
                    icon: desktopOutline,
                    title: "Bureau",
                    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=700&h=500&fit=crop",
                  },
                ].map((item) => (
                  <article key={item.title} className="web-furniture-card">
                    <img src={item.image} alt={item.title} />
                    <div className="web-furniture-card-footer">
                      <IonIcon icon={item.icon} />
                      <span>{item.title}</span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="web-centered-action">
                <button type="button" className="web-home-outline" onClick={() => history.push("/tab3")}>
                  Voir le catalogue meubles
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </div>
            </div>
          </section>

          <section className="web-section web-categories-section">
            <div className="web-section-inner">
              <div className="web-section-title">
                <span>Categories</span>
                <h2>Explorez par type de bien</h2>
                <p>Trouvez le logement qui correspond a votre style de vie a Monastir.</p>
              </div>

              <div className="web-category-grid">
                {[
                  {
                    icon: businessOutline,
                    title: "Appartements",
                    count: "5 biens disponibles",
                    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                  },
                  {
                    icon: homeOutline,
                    title: "Villas",
                    count: "1 biens disponibles",
                    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
                  },
                  {
                    icon: bulbOutline,
                    title: "Studios",
                    count: "2 biens disponibles",
                    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                  },
                ].map((item) => (
                  <article key={item.title} className="web-category-card" onClick={() => history.push("/tab2")}>
                    <img src={item.image} alt={item.title} />
                    <div className="web-category-overlay" />
                    <div className="web-category-content">
                      <div>
                        <IonIcon icon={item.icon} />
                        <strong>{item.title}</strong>
                      </div>
                      <p>{item.count}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="web-owner-cta">
            <div className="web-owner-inner">
              <h2>Vous etes proprietaire ?</h2>
              <p>
                Publiez vos annonces sur ImmoSmart et atteignez des milliers de locataires potentiels a Monastir.
                Gestion simplifiee, visibilite maximale.
              </p>
              <button type="button" className="web-owner-button" onClick={() => history.push("/tab3")}>
                Publier une annonce
                <IonIcon icon={arrowForwardOutline} />
              </button>
            </div>
          </section>

          <footer id="contact-section" className="web-home-footer">
            <div className="web-footer-grid">
              <div>
                <div className="web-footer-brand">
                  <div className="web-footer-logo">
                    <img src="/brand-logo.svg" alt="ImmoSmart logo" className="web-footer-logo-image" />
                  </div>
                  <strong>ImmoSmart</strong>
                </div>
                <p>La plateforme immobiliere intelligente de Monastir. Trouvez, louez et gerez vos biens en toute simplicite.</p>
              </div>

              <div>
                <h4>NAVIGATION</h4>
                <button type="button" onClick={() => scrollToSection("top")}>
                  Accueil
                </button>
                <button type="button" onClick={() => history.push("/tab2")}>
                  Proprietes
                </button>
                <button type="button" onClick={() => scrollToSection("furniture-section")}>
                  Ameublement
                </button>
                <button type="button" onClick={() => scrollToSection("contact-section")}>
                  Contact
                </button>
              </div>

              <div>
                <h4>CONTACT</h4>
                <p>
                  <IonIcon icon={callOutline} />
                  +216 73 461 000
                </p>
                <p>
                  <IonIcon icon={mailOutline} />
                  contact@immosmart.tn
                </p>
                <p>
                  <IonIcon icon={locationOutline} />
                  Monastir, Tunisie
                </p>
              </div>

              <div>
                <h4>RESEAUX SOCIAUX</h4>
                <div className="web-social-row">
                  {[logoFacebook, logoInstagram, logoLinkedin].map((icon, index) => (
                    <button type="button" key={index}>
                      <IonIcon icon={icon} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="web-footer-bottom">© 2026 ImmoSmart - Monastir, Tunisie. Tous droits reserves.</div>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Tab1
