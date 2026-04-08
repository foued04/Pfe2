import { IonContent, IonIcon, IonPage, IonSegment, IonSegmentButton, IonLabel } from "@ionic/react"
import {
  personOutline,
  mailOutline,
  callOutline,
  locationOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  cameraOutline,
  saveOutline,
  lockClosedOutline,
} from "ionicons/icons"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../lib/auth-context"
import { updateProfile, updatePassword } from "../lib/user-api"
import { useHistory } from "react-router-dom"
import "./ProfilePage.css"

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  owner: "Propriétaire",
  tenant: "Locataire",
}

const ProfilePage: React.FC = () => {
  const { user, token, logout, setUser } = useAuth()
  const history = useHistory()
  const [activeTab, setActiveTab] = useState<"personal" | "security">("personal")

  // For name splitting
  const nameParts = (user?.name || "").split(" ")
  const defaultFirstName = nameParts[0] || ""
  const defaultLastName = nameParts.slice(1).join(" ") || ""

  const [formFirstName, setFormFirstName] = useState(user?.firstName || defaultFirstName)
  const [formLastName, setFormLastName] = useState(user?.lastName || defaultLastName)
  const [formPhone, setFormPhone] = useState(user?.phone || "")
  const [formAddress, setFormAddress] = useState(user?.address || "")
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      const parts = (user.name || "").split(" ")
      setFormFirstName(user.firstName || parts[0] || "")
      setFormLastName(user.lastName || parts.slice(1).join(" ") || "")
      setFormPhone(user.phone || "")
      setFormAddress(user.address || "")
      setAvatarPreview(user.avatar || "")
    }
  }, [user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!token) return
    setBusy(true)
    setError("")
    setSuccess("")

    try {
      const fullName = `${formFirstName} ${formLastName}`.trim()
      await updateProfile(
        { fullName, phone: formPhone, address: formAddress, avatar: avatarPreview },
        token,
      )
      setSuccess("Profil mis à jour avec succès.")
      // Ideally we should reload user from API here or update auth context state
      if (setUser && user) {
        // Quick local update to immediately reflect
        setUser({
          ...user,
          name: fullName,
          firstName: formFirstName,
          lastName: formLastName,
          phone: formPhone,
          address: formAddress,
          avatar: avatarPreview
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur mise à jour")
    } finally {
      setBusy(false)
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setBusy(true)
    setError("")
    setSuccess("")

    try {
      await updatePassword({ currentPassword, newPassword }, token)
      setSuccess("Mot de passe modifié avec succès.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur changement mot de passe")
    } finally {
      setBusy(false)
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    history.replace("/account")
  }

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)

  return (
    <IonPage>
      <IonContent fullscreen className="profile-container">
        
        {/* Header matched to web style */}
        <div className="profile-header-bg">
          <h1 className="profile-header-title">Mon Profil</h1>
          <p className="profile-header-subtitle">Gérez vos informations et votre sécurité.</p>
        </div>

        <div className="profile-content-wrapper">
          {error && <div className="status-alert error-alert">{error}</div>}
          {success && <div className="status-alert success-alert">{success}</div>}

          <IonSegment 
            value={activeTab} 
            onIonChange={e => setActiveTab(e.detail.value as any)} 
            className="profile-segment"
          >
            <IonSegmentButton value="personal">
              <IonIcon icon={personOutline} />
              <IonLabel>Informations</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="security">
              <IonIcon icon={shieldCheckmarkOutline} />
              <IonLabel>Sécurité</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {activeTab === "personal" && (
            <div className="tab-contents">
              {/* Photo Card */}
              <div className="web-like-card">
                <div className="card-header">
                  <h3 className="card-title">Photo de profil</h3>
                  <p className="card-subtitle">Une photo professionnelle facilite vos échanges.</p>
                </div>
                <div className="avatar-section">
                  <div className="avatar-preview-box" onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="avatar-img" />
                    ) : (
                      <div className="avatar-initials">{initials}</div>
                    )}
                    <div className="avatar-overlay">
                      <IonIcon icon={cameraOutline} />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                    <IonIcon icon={cameraOutline} /> Télécharger
                  </button>
                </div>
              </div>

              {/* Personal Info Card */}
              <div className="web-like-card mt-4">
                <div className="card-header">
                  <h3 className="card-title">Informations Personnelles</h3>
                  <p className="card-subtitle">Mettez à jour vos coordonnées de contact.</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} placeholder="Prénom" />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input value={formLastName} onChange={(e) => setFormLastName(e.target.value)} placeholder="Nom" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-readonly">
                      <IonIcon icon={mailOutline} />
                      <input value={user?.email || ""} readOnly />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <div className="input-with-icon">
                      <IonIcon icon={callOutline} />
                      <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Votre téléphone" type="tel" />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Adresse</label>
                    <div className="input-with-icon">
                      <IonIcon icon={locationOutline} />
                      <input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Votre adresse complète" />
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="save-submit-btn" disabled={busy} onClick={handleSaveProfile}>
                    <IonIcon icon={saveOutline} />
                    {busy ? "Patientez..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="tab-contents">
              <div className="web-like-card">
                <div className="card-header">
                  <h3 className="card-title">Sécurité</h3>
                  <p className="card-subtitle">Gérez la sécurité de votre compte.</p>
                </div>
                <div className="form-grid single-col">
                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <div className="input-with-icon">
                      <IonIcon icon={lockClosedOutline} />
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Mot de passe actuel" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <div className="input-with-icon">
                      <IonIcon icon={lockClosedOutline} />
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="6 caractères min." />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirmer mot de passe</label>
                    <div className="input-with-icon">
                      <IonIcon icon={lockClosedOutline} />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer" />
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button className="save-submit-btn" disabled={busy} onClick={handleChangePassword}>
                    <IonIcon icon={saveOutline} />
                    {busy ? "Patientez..." : "Mettre à jour mot de passe"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="logout-section mt-4">
            <button className="logout-btn-full" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} />
              Se déconnecter de ImmoSmart
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  )
}

export default ProfilePage
