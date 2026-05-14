import { IonContent, IonIcon, IonLabel, IonModal, IonPage, IonSegment, IonSegmentButton } from "@ionic/react"
import {
  callOutline,
  cameraOutline,
  cardOutline,
  cloudUploadOutline,
  documentOutline,
  documentTextOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  personOutline,
  refreshOutline,
  saveOutline,
  shieldCheckmarkOutline,
  chevronForwardOutline,
  homeOutline,
} from "ionicons/icons"
import { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { updatePassword, updateProfile, uploadVerificationDocument } from "../lib/user-api"
import "./ProfilePage.css"

type MobileDocument = {
  id: string
  name: string
  date: string
  status: string
  type: "id" | "rib"
  previewUrl: string
}

function mapDocuments(user: any): MobileDocument[] {
  const docs: MobileDocument[] = []

  if (user?.documents?.cin?.url) {
    docs.push({
      id: "cin",
      name: "CIN_Importe.pdf",
      date: user.documents.cin.uploadedAt ? new Date(user.documents.cin.uploadedAt).toLocaleDateString() : "---",
      status: user.documents.cin.status || "pending",
      type: "id",
      previewUrl: user.documents.cin.url,
    })
  }

  if (user?.documents?.rib?.url) {
    docs.push({
      id: "rib",
      name: "RIB_Importe.pdf",
      date: user.documents.rib.uploadedAt ? new Date(user.documents.rib.uploadedAt).toLocaleDateString() : "---",
      status: user.documents.rib.status || "pending",
      type: "rib",
      previewUrl: user.documents.rib.url,
    })
  }

  return docs
}

const ProfilePage: React.FC = () => {
  const { user, token, logout, setUser } = useAuth()
  const history = useHistory()
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "documents">("personal")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploadingType, setUploadingType] = useState<"id" | "rib" | "other">("other")
  const [viewingDoc, setViewingDoc] = useState<{ name: string; url: string } | null>(null)

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
  const [documents, setDocuments] = useState<MobileDocument[]>(() => mapDocuments(user))

  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return

    const parts = (user.name || "").split(" ")
    setFormFirstName(user.firstName || parts[0] || "")
    setFormLastName(user.lastName || parts.slice(1).join(" ") || "")
    setFormPhone(user.phone || "")
    setFormAddress(user.address || "")
    setAvatarPreview(user.avatar || "")
    setDocuments(mapDocuments(user))
  }, [user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => setAvatarPreview(event.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!token) return
    setBusy(true)
    setError("")
    setSuccess("")

    try {
      const fullName = `${formFirstName} ${formLastName}`.trim()
      await updateProfile({ fullName, phone: formPhone, address: formAddress, avatar: avatarPreview }, token)
      if (setUser && user) {
        setUser({
          ...user,
          name: fullName,
          firstName: formFirstName,
          lastName: formLastName,
          phone: formPhone,
          address: formAddress,
          avatar: avatarPreview,
        })
      }
      setSuccess("Profil mis a jour avec succes.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur mise a jour")
    } finally {
      setBusy(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres")
      return
    }

    setBusy(true)
    setError("")
    setSuccess("")

    try {
      await updatePassword({ currentPassword, newPassword }, token)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Mot de passe modifie avec succes.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur changement mot de passe")
    } finally {
      setBusy(false)
    }
  }

  const triggerDocUpload = (type: "id" | "rib" | "other") => {
    setUploadingType(type)
    docInputRef.current?.click()
  }

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Unable to read file"))
      reader.readAsDataURL(file)
    })

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    const docType = uploadingType === "rib" ? "rib" : "cin"
    const localPreview = await readFileAsDataUrl(file)
    setBusy(true)
    setError("")
    setSuccess("")

    try {
      const result = await uploadVerificationDocument(docType, localPreview, token)
      setDocuments((prev) => [
        ...prev.filter((doc) => doc.type !== uploadingType),
        {
          id: docType,
          name: file.name,
          date: new Date().toLocaleDateString(),
          status: "pending",
          type: uploadingType as "id" | "rib",
          previewUrl: localPreview,
        },
      ])

      if (setUser && user) {
        setUser({
          ...user,
          documents: result.documents,
        })
      }

      setSuccess("Votre document est en attente de verification.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le document.")
    } finally {
      setBusy(false)
      if (docInputRef.current) docInputRef.current.value = ""
    }
  }

  const handleLogout = () => {
    logout()
    history.replace("/account")
  }

  const openDocPreview = (doc: MobileDocument) => {
    if (doc.name.toLowerCase().endsWith(".pdf")) {
      window.open(doc.previewUrl, "_blank")
      return
    }
    setViewingDoc({ name: doc.name, url: doc.previewUrl })
  }

  const initials = (user?.name || "U")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <IonPage>
      <IonContent fullscreen className="profile-container">
        <div className="profile-header-bg">
          <h1 className="profile-header-title">{user?.role === "tenant" ? "Profil Locataire" : "Mon Profil"}</h1>
          <p className="profile-header-subtitle">
            {user?.role === "tenant"
              ? "Gerez votre dossier de location, vos paiements et votre securite."
              : "Gerez vos informations et votre securite."}
          </p>
        </div>

        <div className="profile-content-wrapper">
          {error ? <div className="status-alert error-alert">{error}</div> : null}
          {success ? <div className="status-alert success-alert">{success}</div> : null}

          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as typeof activeTab)} className="profile-segment">
            <IonSegmentButton value="personal">
              <IonIcon icon={personOutline} />
              <IonLabel>Informations</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="security">
              <IonIcon icon={shieldCheckmarkOutline} />
              <IonLabel>Securite</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="documents">
              <IonIcon icon={documentTextOutline} />
              <IonLabel>Documents</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {activeTab === "personal" ? (
            <div className="tab-contents">
              <div className="web-like-card">
                <div className="card-header">
                  <h3 className="card-title">Photo de profil</h3>
                  <p className="card-subtitle">Une photo professionnelle facilite vos echanges.</p>
                </div>
                <div className="avatar-section">
                  <div className="avatar-preview-box" onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="avatar-img" /> : <div className="avatar-initials">{initials}</div>}
                    <div className="avatar-overlay">
                      <IonIcon icon={cameraOutline} />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                    <IonIcon icon={cameraOutline} /> Telecharger
                  </button>
                </div>
              </div>

              <div className="web-like-card mt-4">
                <div className="card-header">
                  <h3 className="card-title">Informations Personnelles</h3>
                  <p className="card-subtitle">Mettez a jour vos coordonnees de contact.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Prenom</label>
                    <input value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input value={formLastName} onChange={(e) => setFormLastName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-readonly">
                      <IonIcon icon={mailOutline} />
                      <input value={user?.email || ""} readOnly />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Telephone</label>
                    <div className="input-with-icon">
                      <IonIcon icon={callOutline} />
                      <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Adresse</label>
                    <input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
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
          ) : null}

          {activeTab === "security" ? (
            <div className="tab-contents">
              <div className="web-like-card">
                <div className="card-header">
                  <h3 className="card-title">Securite</h3>
                  <p className="card-subtitle">Gerez la securite de votre compte.</p>
                </div>
                <div className="form-grid single-col">
                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <div className="input-with-icon">
                      <IonIcon icon={lockClosedOutline} />
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <div className="input-with-icon">
                      <IonIcon icon={lockClosedOutline} />
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirmer mot de passe</label>
                    <div className="input-with-icon">
                      <IonIcon icon={lockClosedOutline} />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button className="save-submit-btn" disabled={busy} onClick={handleChangePassword}>
                    <IonIcon icon={saveOutline} />
                    {busy ? "Patientez..." : "Mettre a jour mot de passe"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "documents" ? (
            <div className="tab-contents">
              <div className="web-like-card">
                <div className="card-header">
                  <h3 className="card-title">Documents & Justificatifs</h3>
                  <p className="card-subtitle">
                    Gerez les documents d'identite lies a votre profil {user?.role === "tenant" ? "locataire" : "locateur"}.
                  </p>
                </div>

                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" ref={docInputRef} onChange={handleDocUpload} />

                <div className="documents-section">
                  <MobileDocumentSlot
                    doc={documents.find((doc) => doc.type === "id") || null}
                    label="Piece d'identite (CIN)"
                    emptyLabel="Importer CIN"
                    icon={documentOutline}
                    onOpen={openDocPreview}
                    onReplace={() => triggerDocUpload("id")}
                  />

                  <MobileDocumentSlot
                    doc={documents.find((doc) => doc.type === "rib") || null}
                    label="Releve Bancaire (RIB)"
                    emptyLabel="Importer un RIB"
                    icon={cardOutline}
                    onOpen={openDocPreview}
                    onReplace={() => triggerDocUpload("rib")}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {user?.role === "admin" && (
            <div className="tab-contents">
              <div className="web-like-card">
                <div className="card-header">
                  <h3 className="card-title">Administration</h3>
                  <p className="card-subtitle">Gerez les demandes globales de la plateforme.</p>
                </div>
                <div className="documents-section">
                  <button type="button" className="document-slot-card filled" onClick={() => history.push("/admin/housing-needs")}>
                    <div className="document-slot-icon primary">
                      <IonIcon icon={homeOutline} />
                    </div>
                    <div className="document-slot-text">
                      <h4>Besoins Logement</h4>
                      <p>Consulter toutes les demandes des locataires</p>
                    </div>
                    <IonIcon icon={chevronForwardOutline} className="text-primary" />
                  </button>

                  <button type="button" className="document-slot-card filled mt-3" onClick={() => history.push("/admin/users")}>
                    <div className="document-slot-icon primary">
                      <IonIcon icon={personOutline} />
                    </div>
                    <div className="document-slot-text">
                      <h4>Gestion Utilisateurs</h4>
                      <p>Gérer les comptes locateurs et locataires</p>
                    </div>
                    <IonIcon icon={chevronForwardOutline} className="text-primary" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="logout-section mt-4">
            <button className="logout-btn-full" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} />
              Deconnexion
            </button>
          </div>
        </div>

        <IonModal isOpen={!!viewingDoc} onDidDismiss={() => setViewingDoc(null)} className="document-preview-modal">
          <IonContent className="document-preview-content">
            <div className="document-preview-shell">
              <div className="document-preview-header">
                <h3>{viewingDoc?.name}</h3>
              </div>
              <div className="document-preview-body">
                {viewingDoc?.url ? <img src={viewingDoc.url} alt={viewingDoc.name} className="document-preview-image" /> : null}
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

function MobileDocumentSlot({
  doc,
  label,
  emptyLabel,
  icon,
  onOpen,
  onReplace,
}: {
  doc: MobileDocument | null
  label: string
  emptyLabel: string
  icon: string
  onOpen: (doc: MobileDocument) => void
  onReplace: () => void
}) {
  return (
    <div className="document-slot-group">
      <div className="document-slot-label">
        <IonIcon icon={icon} />
        <span>{label}</span>
      </div>

      {doc ? (
        <button type="button" className="document-slot-card filled" onClick={() => onOpen(doc)}>
          <div className={`document-status-badge ${doc.status || "none"}`}>
            {doc.status === "verified" ? "VERIFIE" : doc.status === "rejected" ? "REJETE" : "EN ATTENTE"}
          </div>
          <div className="document-slot-icon primary">
            <IonIcon icon={documentTextOutline} />
          </div>
          <div className="document-slot-text">
            <h4>{doc.name}</h4>
            <p>Ajoute le {doc.date}</p>
          </div>
          <div className="document-slot-action" onClick={(event) => { event.stopPropagation(); onReplace() }}>
            <IonIcon icon={refreshOutline} />
            <span>Remplacer</span>
          </div>
        </button>
      ) : (
        <button type="button" className="document-slot-card empty" onClick={onReplace}>
          <div className="document-slot-icon">
            <IonIcon icon={cloudUploadOutline} />
          </div>
          <div className="document-slot-text">
            <h4>{emptyLabel}</h4>
            <p>PDF, JPG ou PNG</p>
          </div>
        </button>
      )}
    </div>
  )
}

export default ProfilePage
