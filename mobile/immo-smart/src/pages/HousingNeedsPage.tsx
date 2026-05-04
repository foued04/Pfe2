import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar } from "@ionic/react"
import {
  checkmarkCircleOutline,
  clipboardOutline,
  closeOutline,
  createOutline,
  homeOutline,
  notificationsOutline,
  locateOutline,
  sendOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { fetchMyHousingNeed, saveMyHousingNeed } from "../lib/housing-need-api"
import { useAuth } from "../lib/auth-context"
import type { BackendHousingNeed } from "../types/api"
import "../theme/mobile-theme.css"
import "./HousingNeedsPage.css"

const propertyTypes = [
  { value: "s0", label: "S+0" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const bedroomOptions = [
  { value: "1", label: "1 chambre" },
  { value: "2", label: "2 chambres" },
  { value: "3", label: "3 chambres" },
  { value: "4+", label: "4+ chambres" },
]

const durationOptions = [
  { value: "6", label: "6 mois" },
  { value: "12", label: "1 an" },
  { value: "24", label: "2 ans" },
  { value: "36+", label: "3 ans ou plus" },
]

const emptyForm = {
  desiredCity: "",
  department: "",
  minBudget: "",
  maxBudget: "",
  propertyType: "",
  bedrooms: "",
  moveInDate: "",
  duration: "",
  meuble: false,
  parking: false,
  nearCenter: false,
  notes: "",
}

const HousingNeedsPage: React.FC = () => {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [matchesCount, setMatchesCount] = useState(0)
  const [need, setNeed] = useState<BackendHousingNeed | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let active = true

    fetchMyHousingNeed(token)
      .then((data) => {
        if (!active) return

        setNeed(data)
        if (data) {
          setFormData({
            desiredCity: data.desiredCity || "",
            department: data.department || "",
            minBudget: data.minBudget?.toString() || "",
            maxBudget: data.maxBudget?.toString() || "",
            propertyType: data.propertyType || "",
            bedrooms: data.bedrooms || "",
            moveInDate: data.moveInDate || "",
            duration: data.duration || "",
            meuble: Boolean(data.meuble),
            parking: Boolean(data.parking),
            nearCenter: Boolean(data.nearCenter),
            notes: data.notes || "",
          })
        }
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Impossible de charger votre besoin logement.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const summary = useMemo(() => {
    if (!need) return []

    return [
      need.desiredCity ? `Ville: ${need.desiredCity}` : null,
      need.maxBudget ? `Budget max: ${need.maxBudget} TND` : null,
      need.propertyType ? `Type: ${need.propertyType.toUpperCase()}` : null,
      need.bedrooms ? `Chambres: ${need.bedrooms}` : null,
      need.meuble ? "Meuble" : null,
      need.parking ? "Parking" : null,
    ].filter(Boolean) as string[]
  }, [need])

  const updateField = (field: keyof typeof emptyForm, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ ...emptyForm })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await saveMyHousingNeed(
        {
          ...formData,
          minBudget: formData.minBudget,
          maxBudget: formData.maxBudget,
        },
        token,
      )

      setNeed(response.need)
      setMatchesCount(response.matchesCount)
      setSuccess(response.message)
      resetForm()
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer votre besoin logement.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" />
          </IonButtons>
          <IonTitle className="font-title">Besoins Logement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page housing-page">
          <section className="housing-hero">
            <p className="housing-eyebrow">Tenant</p>
            <h1>Besoin logement</h1>
            <p>Renseignez votre besoin en logement et recevez une notification des qu un bien correspondant devient disponible.</p>
          </section>

          <section className="housing-card">
            <div className="housing-card-header">
              <div className="housing-card-title-row">
                <div className="housing-card-icon">
                  <IonIcon icon={homeOutline} />
                </div>
                <div>
                  <h2>Besoin logement</h2>
                  <p>Decrivez le logement recherche. Vous recevrez une notification quand un bien correspondant sera disponible.</p>
                </div>
              </div>
              <button type="button" className="housing-toggle-btn" onClick={() => setIsOpen((current) => !current)}>
                <IonIcon icon={need ? createOutline : clipboardOutline} />
                <span>Besoin logement</span>
              </button>
            </div>

            {isLoading ? (
              <div className="housing-loading">
                <IonSpinner name="crescent" />
                <span>Chargement de votre besoin logement...</span>
              </div>
            ) : null}

            {!isLoading && need ? (
              <div className="housing-summary-card">
                <div className="housing-summary-main">
                  <div className="housing-summary-status">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <span>Besoin enregistre</span>
                  </div>
                  <div className="housing-summary-tags">
                    {summary.map((item) => (
                      <span key={item} className="housing-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                  {need.notes ? <p className="housing-summary-notes">{need.notes}</p> : null}
                </div>
                <div className="housing-alert-box">
                  <div className="housing-alert-title">
                    <IonIcon icon={notificationsOutline} />
                    <span>Alertes actives</span>
                  </div>
                  <p>
                    {matchesCount > 0
                      ? `${matchesCount} logement(s) correspondant(s) detecte(s).`
                      : "Nous surveillons les nouveaux logements pour vous."}
                  </p>
                </div>
              </div>
            ) : null}

            {success ? <p className="housing-message housing-message-success">{success}</p> : null}
            {error ? <p className="housing-message housing-message-error">{error}</p> : null}

            {isOpen ? (
              <form onSubmit={handleSubmit} className="housing-form">
                <div className="housing-grid">
                  <label className="housing-field">
                    <span>Ville souhaitee</span>
                    <div className="housing-input-icon-wrap">
                      <IonIcon icon={locateOutline} />
                      <input
                        type="text"
                        value={formData.desiredCity}
                        onChange={(event) => updateField("desiredCity", event.target.value)}
                        placeholder="Tunis, Sousse, Monastir..."
                        required
                      />
                    </div>
                  </label>

                  <label className="housing-field">
                    <span>Quartier / zone</span>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(event) => updateField("department", event.target.value)}
                      placeholder="Lac 2, La Marsa, Centre ville..."
                    />
                  </label>

                  <label className="housing-field">
                    <span>Budget minimum</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.minBudget}
                      onChange={(event) => updateField("minBudget", event.target.value)}
                      placeholder="500"
                    />
                  </label>

                  <label className="housing-field">
                    <span>Budget maximum</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxBudget}
                      onChange={(event) => updateField("maxBudget", event.target.value)}
                      placeholder="1200"
                    />
                  </label>

                  <label className="housing-field">
                    <span>Type de logement</span>
                    <select value={formData.propertyType} onChange={(event) => updateField("propertyType", event.target.value)}>
                      <option value="">Tous les types</option>
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="housing-field">
                    <span>Nombre de chambres</span>
                    <select value={formData.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)}>
                      <option value="">Peu importe</option>
                      {bedroomOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="housing-field">
                    <span>Date d'entree souhaitee</span>
                    <input
                      type="date"
                      value={formData.moveInDate}
                      onChange={(event) => updateField("moveInDate", event.target.value)}
                    />
                  </label>

                  <label className="housing-field">
                    <span>Duree souhaitee</span>
                    <select value={formData.duration} onChange={(event) => updateField("duration", event.target.value)}>
                      <option value="">Non precisee</option>
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="housing-switch-grid">
                  <label className="housing-switch">
                    <span>Meuble</span>
                    <input
                      type="checkbox"
                      checked={formData.meuble}
                      onChange={(event) => updateField("meuble", event.target.checked)}
                    />
                  </label>

                  <label className="housing-switch">
                    <span>Parking</span>
                    <input
                      type="checkbox"
                      checked={formData.parking}
                      onChange={(event) => updateField("parking", event.target.checked)}
                    />
                  </label>

                  <label className="housing-switch">
                    <span>Pres du centre</span>
                    <input
                      type="checkbox"
                      checked={formData.nearCenter}
                      onChange={(event) => updateField("nearCenter", event.target.checked)}
                    />
                  </label>
                </div>

                <label className="housing-field">
                  <span>Besoin detaille</span>
                  <textarea
                    value={formData.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={5}
                    placeholder="Expliquez exactement ce que vous cherchez: balcon, residence calme, proche universite, etc."
                  />
                </label>

                <div className="housing-actions">
                  <button
                    type="button"
                    className="housing-btn housing-btn-outline"
                    onClick={() => {
                      resetForm()
                      setIsOpen(false)
                    }}
                  >
                    <IonIcon icon={closeOutline} />
                    <span>Fermer</span>
                  </button>
                  <button type="submit" className="housing-btn housing-btn-solid" disabled={isSubmitting}>
                    {isSubmitting ? <IonSpinner name="crescent" /> : <IonIcon icon={sendOutline} />}
                    <span>{isSubmitting ? "Enregistrement..." : "Enregistrer mon besoin"}</span>
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default HousingNeedsPage
