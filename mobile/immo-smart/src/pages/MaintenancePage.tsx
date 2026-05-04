import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar } from "@ionic/react"
import { alertCircleOutline, checkmarkCircleOutline, closeOutline, cloudUploadOutline, sendOutline } from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { createNotification } from "../lib/notification-api"
import { fetchRentalRequests } from "../lib/rental-api"
import type { BackendRentalRequest } from "../types/api"
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

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"))
    reader.readAsDataURL(file)
  })

const MaintenancePage: React.FC = () => {
  const { user, token } = useAuth()
  const [units, setUnits] = useState<TenantUnit[]>([])
  const [unitKey, setUnitKey] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("maintenance")
  const [priority, setPriority] = useState("medium")
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<ReclamationPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let active = true

    fetchRentalRequests(token)
      .then((requests) => {
        if (!active) return

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
        setUnitKey((current) => current || (mappedUnits[0] ? `${mappedUnits[0].propertyId}|${mappedUnits[0].ownerId}` : ""))
        setError("")
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load your properties.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const selectedUnit = useMemo(() => {
    const [propertyId, ownerId] = unitKey.split("|")
    return units.find((unit) => unit.propertyId === propertyId && unit.ownerId === ownerId) || null
  }, [unitKey, units])

  const selectedCategory = categories.find((item) => item.value === category)?.label || "Other"
  const selectedPriority = priorities.find((item) => item.value === priority)?.label || "Medium"

  const handlePhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setSuccess(false)
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) return

    setSuccess(false)
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

      await createNotification(
        {
          recipient: selectedUnit.ownerId,
          type: "Réclamation",
          title,
          preview: `${selectedUnit.title} • ${selectedCategory} • ${selectedPriority}`,
          content,
          status: "En attente",
          attachments: photoDataUrls,
          claimMeta: {
            claimId: `REC-${Date.now()}`,
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
        },
        token,
      )

      setSuccess(true)
      setSubject("")
      setDescription("")
      setCategory("maintenance")
      setPriority("medium")
      setPhotos([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the reclamation.")
    } finally {
      setIsSending(false)
    }
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
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page maintenance-page">
          <section className="maintenance-hero">
            <p className="maintenance-eyebrow">Tenant</p>
            <h1>Reclamation</h1>
            <p>Send a reclamation directly to the home owner responsible for your property.</p>
          </section>

          <section className="maintenance-card">
            <div className="maintenance-card-header">
              <h2>New reclamation</h2>
            </div>

            {success ? (
              <div className="maintenance-alert maintenance-alert-success" role="status">
                <IonIcon icon={checkmarkCircleOutline} />
                <span>Your reclamation has been sent to the home owner.</span>
              </div>
            ) : null}

            {error ? (
              <div className="maintenance-alert maintenance-alert-error" role="alert">
                <IonIcon icon={alertCircleOutline} />
                <span>{error}</span>
              </div>
            ) : null}

            {isLoading ? (
              <div className="maintenance-loading">
                <IonSpinner name="crescent" />
                <span>Loading your properties...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="maintenance-form">
                <div className="maintenance-grid">
                  <label className="maintenance-field">
                    <span>Property</span>
                    <select value={unitKey} onChange={(event) => setUnitKey(event.target.value)} required>
                      {units.length === 0 ? (
                        <option value="">No property available</option>
                      ) : (
                        <>
                          <option value="" disabled>
                            Choose a property
                          </option>
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
                    <span>Subject</span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="Example: Water leak in kitchen"
                      required
                    />
                  </label>
                </div>

                <div className="maintenance-grid">
                  <label className="maintenance-field">
                    <span>Category</span>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      {categories.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="maintenance-field">
                    <span>Priority</span>
                    <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                      {priorities.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="maintenance-field">
                  <span>Description</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the problem and what you need from the home owner."
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
                              aria-label="Remove photo"
                            >
                              <IonIcon icon={closeOutline} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="maintenance-upload-empty">
                        <IonIcon icon={cloudUploadOutline} />
                        <span>Import photos of the reclamation</span>
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

                <button type="submit" className="maintenance-submit" disabled={isSending || units.length === 0}>
                  {isSending ? (
                    <>
                      <IonSpinner name="crescent" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reclamation</span>
                      <IonIcon icon={sendOutline} />
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MaintenancePage
