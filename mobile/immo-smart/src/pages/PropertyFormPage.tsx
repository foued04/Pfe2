import { IonContent, IonIcon, IonPage, IonToggle } from "@ionic/react"
import { arrowBackOutline, saveOutline, cloudUploadOutline, closeOutline } from "ionicons/icons"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { createProperty, updateProperty, fetchProperty } from "../lib/property-api"
import type { PropertyType, CreatePropertyPayload } from "../types/api"
import LoadingSpinner from "../components/LoadingSpinner"
import SectionHeader from "../components/SectionHeader"
import { TUNISIA_GOVERNORATES } from "../data/tunisia-locations"

const typeOptions: { value: PropertyType; label: string }[] = [
  { value: "s0", label: "S+0 (Studio)" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const { token } = useAuth()
  const history = useHistory()

  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [department, setDepartment] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [rent, setRent] = useState("")
  const [deposit, setDeposit] = useState("")
  const [type, setType] = useState<PropertyType>("s2")
  const [surface, setSurface] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [equippedKitchen, setEquippedKitchen] = useState(false)
  const [balcony, setBalcony] = useState(false)
  const [parking, setParking] = useState(false)
  const [meuble, setMeuble] = useState(false)
  const [coverImage, setCoverImage] = useState("")
  const [kitchenImage, setKitchenImage] = useState("")
  const [bathroomImage, setBathroomImage] = useState("")
  const [bedroomImage, setBedroomImage] = useState("")
  const [livingRoomImage, setLivingRoomImage] = useState("")
  const [exteriorImage, setExteriorImage] = useState("")

  useEffect(() => {
    if (!isEdit || !token || !id) return

    let active = true
    const load = async () => {
      try {
        const p = await fetchProperty(id, token)
        if (!active) return
        setTitle(p.title)
        setDescription(p.description)
        setDepartment(p.department || "")
        setCity(p.city)
        setAddress(p.address)
        setRent(String(p.rent))
        setDeposit(String(p.deposit))
        setType(p.type)
        setSurface(String(p.surface))
        setBedrooms(String(p.bedrooms))
        setBathrooms(String(p.bathrooms))
        setEquippedKitchen(p.equippedKitchen || false)
        setBalcony(p.balcony || false)
        setParking(p.parking || false)
        setMeuble(p.meuble || false)
        setCoverImage(p.images?.cover || "")
        setKitchenImage(p.images?.kitchen || "")
        setBathroomImage(p.images?.bathroom || "")
        setBedroomImage(p.images?.bedroom || "")
        setLivingRoomImage(p.images?.livingRoom || "")
        setExteriorImage(p.images?.exterior || "")
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erreur chargement")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [isEdit, id, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (!title.trim() || !department.trim() || !city.trim() || !address.trim() || !rent) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setBusy(true)
    setError("")
    setSuccess("")

    const payload: CreatePropertyPayload = {
      title: title.trim(),
      description: description.trim(),
      department: department.trim(),
      city: city.trim(),
      address: address.trim(),
      rent: Number(rent) || 0,
      deposit: Number(deposit) || 0,
      type,
      surface: Number(surface) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      equippedKitchen,
      balcony,
      parking,
      meuble,
      ...(coverImage || kitchenImage || bathroomImage || bedroomImage || livingRoomImage || exteriorImage ? { 
        images: { 
          ...(coverImage ? { cover: coverImage } : {}),
          ...(kitchenImage ? { kitchen: kitchenImage } : {}),
          ...(bathroomImage ? { bathroom: bathroomImage } : {}),
          ...(bedroomImage ? { bedroom: bedroomImage } : {}),
          ...(livingRoomImage ? { livingRoom: livingRoomImage } : {}),
          ...(exteriorImage ? { exterior: exteriorImage } : {}),
          gallery: [
            kitchenImage,
            bathroomImage,
            bedroomImage,
            livingRoomImage,
            exteriorImage,
          ].filter(Boolean),
        } 
      } : {}),
    }

    try {
      if (isEdit && id) {
        await updateProperty(id, payload, token)
        setSuccess("Propriété modifiée avec succès.")
      } else {
        await createProperty(payload, token)
        setSuccess("Propriété créée avec succès !")
      }
      setTimeout(() => history.goBack(), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setBusy(false)
    }
  }

  const handleImageUpload = (setter: React.Dispatch<React.SetStateAction<string>>, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (result) setter(result)
    }
    reader.readAsDataURL(file)
  }

  const ImageUploadBox = ({ label, image, setter }: { label: string, image: string, setter: React.Dispatch<React.SetStateAction<string>> }) => {
    const id = `img-upload-${label.replace(/\s+/g, '-')}`
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--brand-text)', marginBottom: 6 }}>{label}</label>
        <div 
          onClick={() => { if (!image) document.getElementById(id)?.click() }}
          style={{ 
            position: 'relative', 
            height: 110, 
            border: image ? '1px solid var(--brand-border)' : '2px dashed var(--brand-border)', 
            borderRadius: 12, 
            backgroundColor: image ? 'transparent' : 'rgba(248, 250, 252, 0.5)',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.2s'
          }}
        >
          <input 
            id={id} 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(setter, file);
              e.target.value = ''; // Reset input so same file can be selected again
            }} 
          />
          {image ? (
            <>
              <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setter(""); }}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 16 }} />
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <IonIcon icon={cloudUploadOutline} style={{ fontSize: 28, color: '#94a3b8', marginBottom: 4 }} />
              <div style={{ fontSize: '12px', color: '#64748b' }}>Cliquer pour uploader</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Find current governorate delegations
  const currentGov = TUNISIA_GOVERNORATES.find(g => g.name === department)
  const delegationOptions = currentGov ? currentGov.delegations : []

  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen className="mobile-content">
          <div className="mobile-page">
            <LoadingSpinner message="Chargement de la propriété..." />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <button
            type="button"
            className="link-btn"
            style={{ marginTop: 0, marginBottom: 14 }}
            onClick={() => history.goBack()}
          >
            <IonIcon icon={arrowBackOutline} />
            Retour
          </button>

          <SectionHeader
            badge={isEdit ? "Modifier" : "Nouvelle annonce"}
            title={isEdit ? "Modifier la propriété" : "Ajouter une propriété"}
            subtitle="Remplissez les informations de votre bien immobilier."
          />

          {error ? <p className="auth-status error">{error}</p> : null}
          {success ? <p className="auth-status success">{success}</p> : null}

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="form-section">
              <h3>Informations générales</h3>
              <div className="form-group">
                <label>Titre *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Appartement S+2 Monastir" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre bien..." />
              </div>
              <div className="form-group">
                <label>Type de bien *</label>
                <select value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <h3>Localisation</h3>
              <div className="form-group">
                <label>Gouvernorat *</label>
                <select 
                  value={department} 
                  onChange={(e) => {
                    setDepartment(e.target.value)
                    setCity("")
                  }}
                >
                  <option value="">Sélectionner le gouvernorat</option>
                  {TUNISIA_GOVERNORATES.map((gov) => (
                    <option key={gov.name} value={gov.name}>{gov.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Délégation *</label>
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!department}
                >
                  <option value="">{department ? "Sélectionner la délégation" : "Choisir d'abord un gouvernorat"}</option>
                  {delegationOptions.map((del) => (
                    <option key={del} value={del}>{del}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Adresse *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Rue de la République" />
              </div>
            </div>

            {/* Financial */}
            <div className="form-section">
              <h3>Prix & Financier</h3>
              <div className="form-group">
                <label>Loyer mensuel (TND) *</label>
                <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="Ex: 800" />
              </div>
              <div className="form-group">
                <label>Dépôt de garantie (TND)</label>
                <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="Ex: 1600" />
              </div>
            </div>

            {/* Specs */}
            <div className="form-section">
              <h3>Caractéristiques</h3>
              <div className="form-group">
                <label>Surface (m²)</label>
                <input type="number" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="Ex: 85" />
              </div>
              <div className="form-group">
                <label>Chambres</label>
                <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="Ex: 2" />
              </div>
              <div className="form-group">
                <label>Salles de bain</label>
                <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="Ex: 1" />
              </div>
            </div>

            {/* Amenities */}
            <div className="form-section">
              <h3>Équipements</h3>
              <div className="form-toggle-row">
                <span>Cuisine équipée</span>
                <IonToggle checked={equippedKitchen} onIonChange={(e) => setEquippedKitchen(e.detail.checked)} />
              </div>
              <div className="form-toggle-row">
                <span>Balcon</span>
                <IonToggle checked={balcony} onIonChange={(e) => setBalcony(e.detail.checked)} />
              </div>
              <div className="form-toggle-row">
                <span>Parking</span>
                <IonToggle checked={parking} onIonChange={(e) => setParking(e.detail.checked)} />
              </div>
              <div className="form-toggle-row">
                <span>Meublé</span>
                <IonToggle checked={meuble} onIonChange={(e) => setMeuble(e.detail.checked)} />
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h3>Images</h3>
              <p style={{ fontSize: '13px', color: 'var(--brand-muted)', marginBottom: '16px' }}>
                Cliquez pour importer les images que vous souhaitez afficher. Les champs sont optionnels.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <ImageUploadBox label="Couverture" image={coverImage} setter={setCoverImage} />
                <ImageUploadBox label="Cuisine" image={kitchenImage} setter={setKitchenImage} />
                <ImageUploadBox label="Salle de bain" image={bathroomImage} setter={setBathroomImage} />
                <ImageUploadBox label="Chambre" image={bedroomImage} setter={setBedroomImage} />
                <ImageUploadBox label="Salon" image={livingRoomImage} setter={setLivingRoomImage} />
                <ImageUploadBox label="Extérieur" image={exteriorImage} setter={setExteriorImage} />
              </div>
            </div>

            {error ? <p className="auth-status error" style={{ textAlign: "center", marginBottom: 15 }}>{error}</p> : null}
            {success ? <p className="auth-status success" style={{ textAlign: "center", marginBottom: 15 }}>{success}</p> : null}

            <button type="submit" className="form-submit" disabled={busy}>
              <IonIcon icon={saveOutline} />
              {busy ? "Enregistrement..." : isEdit ? "Modifier la propriété" : "Publier l'annonce"}
            </button>
          </form>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default PropertyFormPage
