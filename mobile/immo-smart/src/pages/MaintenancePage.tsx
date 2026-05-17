import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonBadge, IonAlert, IonRefresher, IonRefresherContent } from "@ionic/react"
import { alertCircleOutline, checkmarkCircleOutline, closeOutline, cloudUploadOutline, sendOutline, timeOutline, createOutline, trashOutline, chevronForwardOutline, chatbubbleEllipsesOutline, calendarOutline } from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { createNotification, fetchSentReclamations, updateReclamation, deleteReclamation } from "../lib/notification-api"
import { fetchRentalRequests } from "../lib/rental-api"
import type { BackendRentalRequest, BackendNotification } from "../types/api"
import "../theme/mobile-theme.css"
import "./MaintenancePage.css"

type TenantUnit = {
  propertyId: string
  ownerId: string
  title: string
  address: string
  status: string
}

type ReclamationPhoto = {
  name: string
  type: string
  size: number
  dataUrl: string
}

const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const categories = [
  { value: "maintenance", label: "Maintenance" },
  { value: "payment", label: "Payment" },
  { value: "contract", label: "Contract" },
  { value: "neighborhood", label: "Neighborhood" },
  { value: "other", label: "Other" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

const statusConfig: Record<string, { label: string, class: string }> = {
  "En attente": { label: "En attente", class: "status-pending" },
  "En cours": { label: "En cours", class: "status-processing" },
  "Resolue": { label: "Résolue", class: "status-resolved" },
  "Refusee": { label: "Refusée", class: "status-rejected" },
  "Vue par le locateur": { label: "Vue", class: "status-viewed" },
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"))
    reader.readAsDataURL(file)
  })

const MaintenancePage: React.FC = () => {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<"new" | "list">("new")
  const [units, setUnits] = useState<TenantUnit[]>([])
  const [myReclamations, setMyReclamations] = useState<BackendNotification[]>([])
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [unitKey, setUnitKey] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("maintenance")
  const [priority, setPriority] = useState("medium")
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<ReclamationPhoto[]>([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    fetchData()
  }, [token])

  const fetchData = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const [requests, reclamations] = await Promise.all([
        fetchRentalRequests(token),
        fetchSentReclamations(token)
      ])

      const mappedUnits = (Array.isArray(requests) ? requests : [])
        .map((request: BackendRentalRequest) => {
          const property = typeof request.property === "string" ? null : request.property
          const owner = property?.owner

          return {
            propertyId: String(property?._id || ""),
            ownerId: String(typeof owner === "string" ? owner : owner?._id || ""),
            title: String(property?.title || "Property"),
            address: String(property?.address || ""),
            status: String(request.status || ""),
          }
        })
        .filter((unit) => unit.propertyId && unit.ownerId)
        .filter((unit) => !unit.status.toLowerCase().includes("refus"))
        .filter(
          (unit, index, list) =>
            list.findIndex((item) => item.propertyId === unit.propertyId && item.ownerId === unit.ownerId) === index,
        )

      setUnits(mappedUnits)
      if (mappedUnits[0] && !unitKey) {
        setUnitKey(`${mappedUnits[0].propertyId}|${mappedUnits[0].ownerId}`)
      }
      
      setMyReclamations(Array.isArray(reclamations) ? reclamations : [])
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedUnit = useMemo(() => {
    const [propertyId, ownerId] = unitKey.split("|")
    return units.find((unit) => unit.propertyId === propertyId && unit.ownerId === ownerId) || null
  }, [unitKey, units])

  const selectedCategory = categories.find((item) => item.value === category)?.label || "Other"
  const selectedPriority = priorities.find((item) => item.value === priority)?.label || "Medium"

  const handlePhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setSuccess("")
    setError("")

    const availableSlots = Math.max(0, MAX_PHOTOS - photos.length)
    const filesToRead = files.slice(0, availableSlots)

    if (files.length > availableSlots) {
      setError(`You can attach up to ${MAX_PHOTOS} photos.`)
    }

    try {
      const nextPhotos = await Promise.all(
        filesToRead.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("INVALID_TYPE")
          }

          if (file.size > MAX_PHOTO_SIZE) {
            throw new Error("TOO_LARGE")
          }

          return {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: await readFileAsDataUrl(file),
          }
        }),
      )

      setPhotos((current) => [...current, ...nextPhotos])
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_TYPE") {
        setError("Please select image files only.")
      } else if (err instanceof Error && err.message === "TOO_LARGE") {
        setError("Each photo must be smaller than 5 MB.")
      } else {
        setError("Unable to import the selected photos.")
      }
    } finally {
      event.target.value = ""
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  const resetForm = () => {
    setEditingId(null)
    setSubject("")
    setDescription("")
    setCategory("maintenance")
    setPriority("medium")
    setPhotos([])
    setUnitKey(units[0] ? `${units[0].propertyId}|${units[0].ownerId}` : "")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    setSuccess("")
    setError("")

    if (!selectedUnit) {
      setError("Please choose the property related to this reclamation.")
      return
    }

    setIsSending(true)

    try {
      const cleanSubject = subject.trim()
      const cleanDescription = description.trim()
      const title = cleanSubject || `Reclamation - ${selectedCategory}`
      const photoDataUrls = photos.map((photo) => photo.dataUrl)
      const content = [
        `Tenant: ${user?.name || "-"}`,
        `Property: ${selectedUnit.title}`,
        `Address: ${selectedUnit.address || "-"}`,
        `Category: ${selectedCategory}`,
        `Priority: ${selectedPriority}`,
        "",
        cleanDescription,
      ].join("\n")

      const data = {
        recipient: selectedUnit.ownerId,
        type: "Réclamation",
        title,
        preview: `${selectedUnit.title} • ${selectedCategory} • ${selectedPriority}`,
        content,
        status: "En attente",
        attachments: photoDataUrls,
        claimMeta: {
          claimId: editingId ? undefined : `REC-${Date.now()}`,
          tenantId: user?.id || "",
          tenantName: user?.name || "",
          ownerId: selectedUnit.ownerId,
          propertyId: selectedUnit.propertyId,
          propertyTitle: selectedUnit.title,
          propertyAddress: selectedUnit.address,
          subject: title,
          category: selectedCategory,
          priority: selectedPriority,
          description: cleanDescription,
          source: "tenant",
          photos: photoDataUrls,
        },
      }

      if (editingId) {
        await updateReclamation(editingId, data, token)
        setSuccess("Your reclamation has been updated.")
      } else {
        await createNotification(data, token)
        setSuccess("Your reclamation has been sent to the locateur.")
      }

      resetForm()
      fetchData()
      setActiveTab("list")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process the reclamation.")
    } finally {
      setIsSending(false)
    }
  }

  const handleEdit = (rec: BackendNotification) => {
    if (!rec.claimMeta) return
    setEditingId(rec._id)
    setSubject(rec.claimMeta.subject || "")
    setDescription(rec.claimMeta.description || "")
    setCategory(categories.find(c => c.label === rec.claimMeta?.category)?.value || "other")
    setPriority(priorities.find(p => p.label === rec.claimMeta?.priority)?.value || "medium")
    setUnitKey(`${rec.claimMeta.propertyId}|${rec.claimMeta.ownerId}`)
    setPhotos((rec.claimMeta.photos || []).map(url => ({ name: "Existing Photo", type: "image/jpeg", size: 0, dataUrl: url })))
    setActiveTab("new")
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteReclamation(deleteId, token)
      setSuccess("Reclamation deleted successfully.")
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete.")
    } finally {
      setDeleteId(null)
    }
  }

  const handleRefresh = (event: CustomEvent) => {
    fetchData().finally(() => event.detail.complete())
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" />
          </IonButtons>
          <IonTitle className="font-title">Réclamations</IonTitle>
        </IonToolbar>
        <IonToolbar className="immosmart-toolbar px-2 pb-2">
          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as any)} mode="ios" className="immosmart-segment">
            <IonSegmentButton value="new">
              <IonLabel>{editingId ? "Modifier" : "Nouvelle"}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="list">
              <IonLabel>Mes suivis</IonLabel>
              {myReclamations.length > 0 && <IonBadge color="primary">{myReclamations.length}</IonBadge>}
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="mobile-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="mobile-page maintenance-page">
          {activeTab === "new" ? (
            <>
              <section className="maintenance-hero">
                <p className="maintenance-eyebrow">Tenant</p>
                <h1>{editingId ? "Modifier Réclamation" : "Réclamation"}</h1>
                <p>Signalez un problème directement au locateur de votre logement.</p>
              </section>

              <section className="maintenance-card">
                <div className="maintenance-card-header">
                  <h2>{editingId ? "Modifier les détails" : "Nouveau signalement"}</h2>
                </div>

                {success ? (
                  <div className="maintenance-alert maintenance-alert-success" role="status">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <span>{success}</span>
                  </div>
                ) : null}

                {error ? (
                  <div className="maintenance-alert maintenance-alert-error" role="alert">
                    <IonIcon icon={alertCircleOutline} />
                    <span>{error}</span>
                  </div>
                ) : null}

                {isLoading && units.length === 0 ? (
                  <div className="maintenance-loading">
                    <IonSpinner name="crescent" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="maintenance-form">
                    <div className="maintenance-grid">
                      <label className="maintenance-field">
                        <span>Logement / Locateur</span>
                        <select value={unitKey} onChange={(event) => setUnitKey(event.target.value)} required disabled={!!editingId}>
                          {units.length === 0 ? (
                            <option value="">Aucune propriété</option>
                          ) : (
                            <>
                              <option value="" disabled>Choisir une propriété</option>
                              {units.map((unit) => (
                                <option key={`${unit.propertyId}|${unit.ownerId}`} value={`${unit.propertyId}|${unit.ownerId}`}>
                                  {unit.title}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        {selectedUnit ? <small>{selectedUnit.address}</small> : null}
                      </label>

                      <label className="maintenance-field">
                        <span>Sujet</span>
                        <input
                          type="text"
                          value={subject}
                          onChange={(event) => setSubject(event.target.value)}
                          placeholder="Ex: Fuite d'eau cuisine"
                          required
                        />
                      </label>
                    </div>

                    <div className="maintenance-grid">
                      <label className="maintenance-field">
                        <span>Catégorie</span>
                        <select value={category} onChange={(event) => setCategory(event.target.value)}>
                          {categories.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="maintenance-field">
                        <span>Priorité</span>
                        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                          {priorities.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="maintenance-field">
                      <span>Description</span>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Décrivez le problème en détail..."
                        required
                      />
                    </label>

                    <div className="maintenance-field">
                      <span>Photos</span>
                      <label htmlFor="reclamation-photos" className="maintenance-upload">
                        {photos.length > 0 ? (
                          <div className="maintenance-photo-grid">
                            {photos.map((photo, index) => (
                              <div key={`${photo.name}-${index}`} className="maintenance-photo-card">
                                <img src={photo.dataUrl} alt={photo.name} />
                                <button
                                  type="button"
                                  className="maintenance-remove-photo"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    removePhoto(index)
                                  }}
                                >
                                  <IonIcon icon={closeOutline} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="maintenance-upload-empty">
                            <IonIcon icon={cloudUploadOutline} />
                            <span>Importer des photos</span>
                          </div>
                        )}
                        <input
                          id="reclamation-photos"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotosChange}
                          disabled={photos.length >= MAX_PHOTOS}
                        />
                      </label>
                    </div>

                    <div className="flex-row gap-2 mt-4">
                      {editingId && (
                        <button type="button" className="maintenance-cancel flex-1" onClick={resetForm}>
                          Annuler
                        </button>
                      )}
                      <button type="submit" className="maintenance-submit flex-1" disabled={isSending || units.length === 0}>
                        {isSending ? (
                          <><IonSpinner name="crescent" /><span>Traitement...</span></>
                        ) : (
                          <><span>{editingId ? "Mettre à jour" : "Envoyer"}</span><IonIcon icon={sendOutline} /></>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </>
          ) : (
            <div className="reclamations-list-container">
              <section className="maintenance-hero">
                <h1>Mes suivis</h1>
                <p>Consultez l'état d'avancement de vos réclamations.</p>
              </section>

              {myReclamations.length === 0 ? (
                <div className="empty-state">
                  <IonIcon icon={timeOutline} />
                  <h3>Aucune réclamation</h3>
                  <p>Vous n'avez pas encore envoyé de réclamation.</p>
                  <button className="maintenance-submit mt-4" onClick={() => setActiveTab("new")}>
                    Créer ma première réclamation
                  </button>
                </div>
              ) : (
                <div className="reclamations-list">
                  {myReclamations.map((rec) => {
                    const statusStr = rec.status || ""
                    const status = statusConfig[statusStr] || { label: statusStr, class: "status-default" }
                    const isModifiable = !["Resolue", "Refusee"].includes(statusStr)

                    return (
                      <div key={rec._id} className="reclamation-item-card">
                        <div className="item-header">
                          <div className="item-title-group">
                            <h3>{rec.claimMeta?.subject}</h3>
                            <span className={`status-badge ${status.class}`}>{status.label}</span>
                          </div>
                          <div className="item-actions">
                            {isModifiable && (
                              <>
                                <button onClick={() => handleEdit(rec)} className="action-btn edit">
                                  <IonIcon icon={createOutline} />
                                </button>
                                <button onClick={() => setDeleteId(rec._id)} className="action-btn delete">
                                  <IonIcon icon={trashOutline} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="item-meta">
                          <div className="meta-row">
                            <IonIcon icon={calendarOutline} />
                            <span>Envoyé le {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : ""}</span>
                          </div>
                          <div className="meta-row">
                            <IonIcon icon={chevronForwardOutline} />
                            <span>{rec.claimMeta?.propertyTitle}</span>
                          </div>
                        </div>

                        <p className="item-description">{rec.claimMeta?.description}</p>

                        {rec.claimResponse && (
                          <div className="item-response">
                            <div className="response-header">
                              <IonIcon icon={chatbubbleEllipsesOutline} />
                              <span>Réponse du locateur</span>
                            </div>
                            <p>{rec.claimResponse.message}</p>
                          </div>
                        )}
                        
                        {(rec.claimMeta?.photos || []).length > 0 && (
                          <div className="item-photos-preview">
                            {(rec.claimMeta?.photos || []).slice(0, 3).map((p, i) => (
                              <img key={i} src={p} alt="Attachment" />
                            ))}
                            {(rec.claimMeta?.photos || []).length > 3 && (
                              <div className="more-photos">+{(rec.claimMeta?.photos || []).length - 3}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <IonAlert
          isOpen={!!deleteId}
          onDidDismiss={() => setDeleteId(null)}
          header={"Supprimer la réclamation ?"}
          message={"Cette action est irréversible. Le locateur ne verra plus ce signalement."}
          buttons={[
            { text: "Annuler", role: "cancel" },
            { text: "Supprimer", handler: handleDelete, cssClass: "alert-button-delete" }
          ]}
        />
      </IonContent>
    </IonPage>
  )
}

export default MaintenancePage
