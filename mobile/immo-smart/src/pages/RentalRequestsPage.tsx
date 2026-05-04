import { IonContent, IonIcon, IonPage } from "@ionic/react"
import { arrowBackOutline, callOutline, chatbubblesOutline, checkmarkCircleOutline, closeCircleOutline, documentTextOutline, downloadOutline, homeOutline, mailOutline, personOutline, printOutline, sendOutline, timeOutline } from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import MobileChat from "../components/MobileChat"
import MobilePdfLayout from "../components/MobilePdfLayout"
import MobileSignaturePad from "../components/MobileSignaturePad"
import SectionHeader from "../components/SectionHeader"
import { useAuth } from "../lib/auth-context"
import { activateContract, fetchContract, generateContract, sendContractBackToOwner, sendContractToTenant, signContract } from "../lib/contract-api"
import { fetchRentalRequests, updateRentalRequestStatus } from "../lib/rental-api"
import type { BackendContract, BackendProperty, BackendRentalRequest, RentalRequestStatus } from "../types/api"

const RentalRequestsPage: React.FC = () => {
  const { user, token } = useAuth()
  const location = useLocation()
  const [requests, setRequests] = useState<BackendRentalRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState("")
  const [selectedContract, setSelectedContract] = useState<BackendContract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [contractBusy, setContractBusy] = useState(false)
  const [contractError, setContractError] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    const element = document.getElementById("mobile-contract-pdf-content")
    if (!element) return

    const printWindow = window.open("", "_blank", "width=900,height=1200")
    if (!printWindow) return

    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((node) => node.outerHTML)
      .join("")

    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>Contrat ImmoSmart ${selectedContract?._id || ""}</title>
          ${styles}
        </head>
        <body style="margin:0;background:#ffffff;">
          ${element.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const handleDownloadPdf = async () => {
    if (!selectedContract) return
    try {
      setIsDownloading(true)
      const html2pdf = (await import("html2pdf.js")).default
      const element = document.getElementById("mobile-contract-pdf-content")
      if (!element) return

      await html2pdf()
        .set({
          margin: 10,
          filename: `Contrat-ImmoSmart-${selectedContract._id.slice(-6)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save()
    } catch (err) {
      alert("Erreur lors du téléchargement : " + (err instanceof Error ? err.message : "Erreur inconnue"))
    } finally {
      setIsDownloading(false)
    }
  }

  const isOwner = user?.role === "owner"
  const selectedRequest = useMemo(
    () => requests.find((request) => request._id === selectedRequestId) || null,
    [requests, selectedRequestId],
  )

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await fetchRentalRequests(token)
        if (active) setRequests(data)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erreur chargement")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [token])

  // Handle auto-opening from URL ID
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get("id")
    if (id && requests.length > 0) {
      const found = requests.find(r => r._id === id)
      if (found) {
        openRequestDetail(found)
        // Clean up URL without reload
        window.history.replaceState({}, '', location.pathname)
      }
    }
  }, [location.search, requests])

  const syncRequestStatus = (requestId: string, status: RentalRequestStatus) => {
    setRequests((prev) => prev.map((request) => (request._id === requestId ? { ...request, status } : request)))
  }

  const loadContractForRequest = async (requestId: string, generateIfMissing = false) => {
    if (!token) return null

    setContractBusy(true)
    setContractError("")

    try {
      const contract = await fetchContract(requestId, token)
      setSelectedContract(contract)
      return contract
    } catch (err) {
      if (!generateIfMissing) {
        setSelectedContract(null)
        setContractError(err instanceof Error ? err.message : "Contrat introuvable")
        return null
      }

      try {
        await generateContract({ requestId }, token)
        const generatedContract = await fetchContract(requestId, token)
        setSelectedContract(generatedContract)
        syncRequestStatus(requestId, "Contrat généré")
        return generatedContract
      } catch (generationErr) {
        setSelectedContract(null)
        setContractError(generationErr instanceof Error ? generationErr.message : "Impossible de générer le contrat.")
        return null
      }
    } finally {
      setContractBusy(false)
    }
  }

  const openRequestDetail = async (request: BackendRentalRequest) => {
    setSelectedRequestId(request._id)
    setSelectedContract(null)
    setContractError("")

    if (request.status === "Acceptée" || request.status === "Contrat généré" || request.status === "Contrat actif") {
      await loadContractForRequest(request._id, request.status === "Acceptée")
    }
  }

  const handleStatusUpdate = async (requestId: string, status: "Acceptée" | "Refusée") => {
    if (!token) return
    setActionBusy(requestId)
    setContractError("")

    try {
      const updated = await updateRentalRequestStatus(requestId, status, token)
      syncRequestStatus(requestId, updated.status)

      if (selectedRequestId === requestId) {
        setSelectedContract(null)
      }

      if (status === "Acceptée") {
        setSelectedRequestId(requestId)
        await loadContractForRequest(requestId, true)
      }
    } catch (err) {
      setContractError(err instanceof Error ? err.message : "Impossible de mettre à jour la demande.")
    } finally {
      setActionBusy(null)
    }
  }

  const handleSignContract = async (signature: string) => {
    if (!token || !selectedContract) return
    setActionBusy(selectedContract._id)
    try {
      const updated = await signContract(selectedContract._id, { signature }, token)
      setSelectedContract(updated)
      alert("Contrat signé avec succès !")
    } catch (err) {
      alert("Erreur lors de la signature : " + (err instanceof Error ? err.message : "Erreur inconnue"))
    } finally {
      setActionBusy(null)
    }
  }

  const handleSendContract = async () => {
    if (!token || !selectedContract) return
    setActionBusy(selectedContract._id)
    try {
      let updated
      if (isOwner) {
        updated = await sendContractToTenant(selectedContract._id, { message: "J'ai signé le contrat de location. Veuillez le consulter et le signer." }, token)
        alert("Contrat envoyé au locataire !")
      } else {
        updated = await sendContractBackToOwner(selectedContract._id, { message: "J'ai signé le contrat de location. Vous pouvez maintenant l'activer." }, token)
        alert("Contrat renvoyé au propriétaire !")
      }
      setSelectedContract(updated)
      syncRequestStatus(updated.request as string, updated.status as any)
    } catch (err) {
      alert("Erreur lors de l'envoi : " + (err instanceof Error ? err.message : "Erreur inconnue"))
    } finally {
      setActionBusy(null)
    }
  }

  const handleFinalActivate = async () => {
    if (!token || !selectedContract) return
    setActionBusy(selectedContract._id)
    try {
      const updated = await activateContract(selectedContract._id, token)
      setSelectedContract(updated)
      syncRequestStatus(updated.request as string, "Contrat actif")
      alert("Contrat activé ! Le bien est officiellement loué.")
    } catch (err) {
      alert("Erreur lors de l'activation : " + (err instanceof Error ? err.message : "Erreur inconnue"))
    } finally {
      setActionBusy(null)
    }
  }

  const getProperty = (request: BackendRentalRequest) => (
    typeof request.property === "object" && request.property !== null ? (request.property as BackendProperty) : null
  )

  const getPropertyTitle = (request: BackendRentalRequest): string => getProperty(request)?.title || "Propriété"
  const getPropertyAddress = (request: BackendRentalRequest): string => {
    const property = getProperty(request)
    return property ? `${property.city || ""} - ${property.address || ""}`.trim() : "Adresse inconnue"
  }
  const getPropertyImage = (request: BackendRentalRequest): string =>
    getProperty(request)?.images?.cover ||
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop"

  const getTenantName = (request: BackendRentalRequest): string =>
    typeof request.tenant === "object" && request.tenant !== null ? request.tenant.fullName : "Locataire"
  const getTenantEmail = (request: BackendRentalRequest): string =>
    typeof request.tenant === "object" && request.tenant !== null ? request.tenant.email || "-" : "-"
  const getTenantPhone = (request: BackendRentalRequest): string =>
    typeof request.tenant === "object" && request.tenant !== null ? request.tenant.phone || "-" : "-"

  const getRecipientId = (request: BackendRentalRequest): string => {
    if (isOwner) {
      return typeof request.tenant === "object" && request.tenant !== null ? request.tenant._id || "" : String(request.tenant)
    } else {
      const property = getProperty(request)
      if (!property) return ""
      return typeof property.owner === "object" && property.owner !== null ? property.owner._id || "" : String(property.owner)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "Acceptée":
      case "Contrat généré":
      case "Contrat actif":
      case "SignedByBoth":
        return checkmarkCircleOutline
      case "Refusée":
        return closeCircleOutline
      default:
        return timeOutline
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "Acceptée":
      case "Refusée":
      case "Contrat généré":
      case "Contrat actif":
      case "SignedByBoth":
        return status
      default:
        return "En attente"
    }
  }

  const requestStatusClass = (status: string) => {
    switch (status) {
      case "Acceptée":
      case "Contrat généré":
      case "Contrat actif":
      case "SignedByBoth":
        return "approved"
      case "Refusée":
        return "rejected"
      default:
        return "pending"
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const detailStages = ["En attente", "Acceptée", "Contrat généré", "Contrat actif"]
  const activeStageIndex = selectedRequest ? Math.max(0, detailStages.indexOf(selectedRequest.status || "En attente")) : 0

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page rental-requests-page">
          <SectionHeader
            badge={isOwner ? "Propriétaire" : "Locataire"}
            title="Demandes de location"
            subtitle={
              isOwner
                ? "Gérez les demandes reçues et affichez le contrat juste après acceptation."
                : "Suivez l'état de vos demandes de location."
            }
          />

          {loading ? (
            <LoadingSpinner message="Chargement des demandes..." />
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={documentTextOutline}
              title="Aucune demande"
              message={isOwner ? "Vous n'avez pas encore reçu de demandes." : "Vous n'avez pas encore soumis de demandes."}
            />
          ) : !selectedRequest ? (
            <div className="request-list-grid">
              {requests.map((request) => (
                <button key={request._id} type="button" className="request-card request-card-button" onClick={() => openRequestDetail(request)}>
                  <div className="request-card-top">
                    <div>
                      <h4>{getPropertyTitle(request)}</h4>
                      <p>{request.message || (isOwner ? "Demande de location reçue" : "Votre demande de location")}</p>
                    </div>
                    <span className={`request-status ${requestStatusClass(request.status || "En attente")}`}>
                      <IonIcon icon={statusIcon(request.status || "En attente")} />
                      {statusLabel(request.status || "En attente")}
                    </span>
                  </div>

                  <p className="request-card-meta">{getPropertyAddress(request)}</p>
                  <p className="request-card-meta">{formatDate(request.createdAt || request.date)}</p>

                  {isOwner && (request.status === "En attente" || !request.status) ? (
                    <div className="request-actions">
                      <button
                        type="button"
                        className="approve-btn"
                        disabled={actionBusy === request._id}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleStatusUpdate(request._id, "Acceptée")
                        }}
                      >
                        <IonIcon icon={checkmarkCircleOutline} />
                        {actionBusy === request._id ? "..." : "Approuver"}
                      </button>
                      <button
                        type="button"
                        className="reject-btn"
                        disabled={actionBusy === request._id}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleStatusUpdate(request._id, "Refusée")
                        }}
                      >
                        <IonIcon icon={closeCircleOutline} />
                        Refuser
                      </button>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="request-detail-shell">
              <button type="button" className="link-btn" onClick={() => setSelectedRequestId("")}>
                <IonIcon icon={arrowBackOutline} />
                Retour aux demandes
              </button>

              <div className="request-detail-progress">
                {detailStages.map((stage, index) => (
                  <div key={stage} className={`request-step ${index <= activeStageIndex ? "active" : ""}`}>
                    <span>{index + 1}</span>
                    <strong>{stage}</strong>
                  </div>
                ))}
              </div>

              <div className="request-detail-grid">
                <section className="request-detail-card">
                  <div className="request-detail-card-head">
                    <IonIcon icon={personOutline} />
                    <h3>Locataire</h3>
                  </div>
                  <div className="request-detail-person">
                    <strong>{getTenantName(selectedRequest)}</strong>
                    <span>Locataire candidat</span>
                  </div>
                  <div className="request-detail-meta">
                    <p><IonIcon icon={mailOutline} /> {getTenantEmail(selectedRequest)}</p>
                    <p><IonIcon icon={callOutline} /> {getTenantPhone(selectedRequest)}</p>
                    <p><IonIcon icon={timeOutline} /> Demande du {formatDate(selectedRequest.createdAt || selectedRequest.date)}</p>
                    <p><IonIcon icon={documentTextOutline} /> Durée souhaitée : {selectedRequest.duration || "-"}</p>
                  </div>
                </section>

                <section className="request-detail-card property">
                  <img src={getPropertyImage(selectedRequest)} alt={getPropertyTitle(selectedRequest)} />
                  <div className="request-detail-property-copy">
                    <strong>{getPropertyTitle(selectedRequest)}</strong>
                    <span>{getPropertyAddress(selectedRequest)}</span>
                    <small>{getProperty(selectedRequest)?.rent?.toLocaleString("fr-FR") || 0} TND / mois</small>
                  </div>
                </section>
              </div>

              <section className="request-detail-card">
                <div className="request-detail-card-head">
                  <IonIcon icon={documentTextOutline} />
                  <h3>Message de la demande</h3>
                </div>
                <p className="request-detail-message">{selectedRequest.message || "Aucun message complémentaire."}</p>
              </section>

              <section id="chat-section" className="request-detail-card">
                <div className="request-detail-card-head">
                  <IonIcon icon={chatbubblesOutline} />
                  <h3>Discussion avec le {isOwner ? "locataire" : "propriétaire"}</h3>
                </div>
                <MobileChat 
                  contextId={selectedRequest._id}
                  contextTitle={`Demande ${getPropertyTitle(selectedRequest)}`}
                  recipientId={getRecipientId(selectedRequest)}
                  category="Demandes"
                />
              </section>

              {contractBusy ? <LoadingSpinner message="Préparation du contrat..." /> : null}
              {contractError ? <p className="auth-status error">{contractError}</p> : null}

              {selectedContract ? (
                <section className="request-detail-card contract">
                  <div className="request-detail-card-head">
                    <IonIcon icon={documentTextOutline} />
                    <div style={{ flex: 1 }}>
                      <h3>Détails du contrat</h3>
                    </div>
                    {selectedContract.status === "SignedByBoth" || selectedContract.status === "Contrat actif" ? (
                      <div className="contract-header-actions">
                        <button className="mini-tool-btn" onClick={handleDownloadPdf} disabled={isDownloading}>
                          <IonIcon icon={downloadOutline} />
                          {isDownloading ? "..." : "PDF"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="request-contract-grid">
                    <div>
                      <span className="request-contract-label">Statut contrat</span>
                      <strong>{selectedContract.status || "Draft"}</strong>
                    </div>
                    <div>
                      <span className="request-contract-label">Loyer</span>
                      <strong>
                        {(
                          (selectedContract as BackendContract & { rentAmount?: number; monthlyRent?: number }).monthlyRent ||
                          (selectedContract as BackendContract & { rentAmount?: number; monthlyRent?: number }).rentAmount ||
                          getProperty(selectedRequest)?.rent ||
                          0
                        ).toLocaleString("fr-FR")} TND
                      </strong>
                    </div>
                    <div>
                      <span className="request-contract-label">Caution</span>
                      <strong>
                        {(
                          (selectedContract as BackendContract & { depositAmount?: number }).depositAmount ||
                          ((getProperty(selectedRequest)?.rent || 0) * 2)
                        ).toLocaleString("fr-FR")} TND
                      </strong>
                    </div>
                    <div>
                      <span className="request-contract-label">Période</span>
                      <strong>
                        {selectedContract.startDate ? formatDate(selectedContract.startDate) : "À définir"}
                        {selectedContract.endDate ? ` → ${formatDate(selectedContract.endDate)}` : ""}
                      </strong>
                    </div>
                    <div>
                      <span className="request-contract-label">Signature propriétaire</span>
                      <strong>{selectedContract.ownerSignature ? "Ajoutée" : "En attente"}</strong>
                    </div>
                    <div>
                      <span className="request-contract-label">Signature locataire</span>
                      <strong>{selectedContract.tenantSignature ? "Ajoutée" : "En attente"}</strong>
                    </div>
                  </div>

                  <div className="contract-signature-zone">
                    {isOwner ? (
                      <MobileSignaturePad 
                        label="Signature du Propriétaire" 
                        existingSignature={selectedContract.ownerSignature}
                        onSign={handleSignContract}
                        disabled={selectedContract.status !== "Draft" && selectedContract.status !== "Contrat généré"}
                      />
                    ) : (
                      <MobileSignaturePad 
                        label="Signature du Locataire" 
                        existingSignature={selectedContract.tenantSignature}
                        onSign={handleSignContract}
                        disabled={selectedContract.status !== "SentToTenant"}
                      />
                    )}

                    {isOwner && selectedContract.ownerSignature && (selectedContract.status === "Draft" || selectedContract.status === "Contrat généré" || selectedContract.status === "SignedByOwner") && (
                      <button className="detail-cta sign-cta" onClick={handleSendContract} disabled={!!actionBusy}>
                        <IonIcon icon={sendOutline} />
                        Envoyer au locataire
                      </button>
                    )}

                    {!isOwner && selectedContract.tenantSignature && (selectedContract.status === "SentToTenant" || selectedContract.status === "SignedByTenant") && (
                      <button className="detail-cta sign-cta" onClick={handleSendContract} disabled={!!actionBusy}>
                        <IonIcon icon={sendOutline} />
                        Renvoyer signé au propriétaire
                      </button>
                    )}

                    {isOwner && selectedContract.status === "SignedByTenant" && (
                      <button className="detail-cta activate-cta" onClick={handleFinalActivate} disabled={!!actionBusy}>
                        <IonIcon icon={checkmarkCircleOutline} />
                        Activer le contrat final
                      </button>
                    )}
                  </div>
                </section>
              ) : null}

              <div className="request-actions">
                <button
                  type="button"
                  className="chat-btn"
                  onClick={() => {
                    const el = document.getElementById("chat-section")
                    el?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <IonIcon icon={chatbubblesOutline} />
                  Message
                </button>
                {isOwner && (selectedRequest.status === "En attente" || !selectedRequest.status) ? (
                  <>
                    <button
                      type="button"
                      className="approve-btn"
                      disabled={actionBusy === selectedRequest._id}
                      onClick={() => handleStatusUpdate(selectedRequest._id, "Acceptée")}
                    >
                      <IonIcon icon={checkmarkCircleOutline} />
                      {actionBusy === selectedRequest._id ? "..." : "Approuver et afficher le contrat"}
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      disabled={actionBusy === selectedRequest._id}
                      onClick={() => handleStatusUpdate(selectedRequest._id, "Refusée")}
                    >
                      <IonIcon icon={closeCircleOutline} />
                      Refuser
                    </button>
                  </>
                ) : null}
              </div>

              {isOwner && selectedRequest.status === "Acceptée" && !selectedContract && !contractBusy ? (
                <button type="button" className="detail-cta" onClick={() => loadContractForRequest(selectedRequest._id, true)}>
                  <IonIcon icon={documentTextOutline} />
                  Générer le contrat
                </button>
              ) : null}
            </div>

            {/* Hidden PDF Layout for capture */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
              {selectedContract && (
                <MobilePdfLayout
                  id="mobile-contract-pdf-content"
                  title="Contrat de Location"
                  documentId={selectedContract._id.slice(-8).toUpperCase()}
                  date={formatDate(selectedContract.createdAt)}
                  infoLeft={
                    <div>
                      <strong>Propriétaire</strong>
                      <p>{selectedContract.ownerName}</p>
                      <p>{selectedContract.ownerPhone}</p>
                    </div>
                  }
                  infoRight={
                    <div>
                      <strong>Locataire</strong>
                      <p>{selectedContract.tenantName}</p>
                      <p>{selectedContract.tenantPhone}</p>
                    </div>
                  }
                >
                  <div style={{ padding: "10px 0" }}>
                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Détails du bien</h3>
                    <p><strong>{getPropertyTitle(selectedRequest!)}</strong></p>
                    <p>{getPropertyAddress(selectedRequest!)}</p>
                    
                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "5px", marginTop: "15px" }}>Conditions</h3>
                    <p>Loyer mensuel : {selectedContract.monthlyRent || getProperty(selectedRequest!)?.rent} TND</p>
                    <p>Caution : {selectedContract.depositAmount || ((getProperty(selectedRequest!)?.rent || 0) * 2)} TND</p>
                    <p>Période : {formatDate(selectedContract.startDate)} au {formatDate(selectedContract.endDate)}</p>
                    
                    <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <p>Signature Propriétaire</p>
                        {selectedContract.ownerSignature && <img src={selectedContract.ownerSignature} width="100" alt="Signature" />}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p>Signature Locataire</p>
                        {selectedContract.tenantSignature && <img src={selectedContract.tenantSignature} width="100" alt="Signature" />}
                      </div>
                    </div>
                  </div>
                </MobilePdfLayout>
              )}
                </div>
              </>
            )}
          </div>
      </IonContent>
    </IonPage>
  )
}

export default RentalRequestsPage
