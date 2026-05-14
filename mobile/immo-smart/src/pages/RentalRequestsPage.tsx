import { IonContent, IonIcon, IonPage, IonModal, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonList, IonItem, IonLabel, IonTextarea, IonInput, IonSelect, IonSelectOption, IonBadge, IonImg } from "@ionic/react"
import { 
  alertCircleOutline, 
  arrowBackOutline, 
  callOutline, 
  chatbubblesOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline, 
  documentTextOutline, 
  downloadOutline, 
  homeOutline, 
  mailOutline, 
  personOutline, 
  printOutline, 
  sendOutline, 
  timeOutline,
  calendarOutline,
  constructOutline,
  timerOutline,
  cashOutline,
  cartOutline,
  statsChartOutline,
  trashOutline,
  createOutline,
  addOutline,
  chevronForwardOutline,
  checkmarkDoneCircleOutline,
  pricetagOutline,
  imagesOutline
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useHistory } from "react-router-dom"
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
import { resolveApiUrl } from "../lib/api/client"
import http from "../lib/http"

const mockPayments = [
  { id: "pay-001", reference: "FAC-2026-001", tenantName: "Mohamed Jlassi", propertyTitle: "Villa Luxe S+4 Khnis", amount: 1500, date: "2026-04-01", status: "Payé", method: "Virement" },
  { id: "pay-002", reference: "FAC-2026-002", tenantName: "Sarra Bouaziz", propertyTitle: "Appartement S+3 Familial Khniss", amount: 950, date: "2026-04-15", status: "Payé", method: "Espèces" },
  { id: "pay-003", reference: "FAC-2026-003", tenantName: "Ahmed Mansour", propertyTitle: "Studio S+1 Monastir Centre", amount: 450, date: "2026-05-01", status: "Payé", method: "Carte" },
  { id: "pay-004", reference: "FAC-2026-004", tenantName: "Faten Rouissi", propertyTitle: "Duplex Standing S+3 Skanes", amount: 1200, date: "2026-05-05", status: "Refusé", method: "Carte" },
  { id: "pay-005", reference: "FAC-2026-005", tenantName: "Mohamed Jlassi", propertyTitle: "Villa Luxe S+4 Khnis", amount: 1500, date: "2026-05-01", status: "Payé", method: "Virement" },
  { id: "pay-006", reference: "FAC-2026-006", tenantName: "Yassine Belhadj", propertyTitle: "Appartement S+2 Sahline", amount: 650, date: "2026-05-10", status: "En attente", method: "Virement" }
]

const RentalRequestsPage: React.FC = () => {
  const { user, token } = useAuth()
  const location = useLocation()
  const history = useHistory()
  const [requests, setRequests] = useState<BackendRentalRequest[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [furnitureSuggestions, setFurnitureSuggestions] = useState<any[]>([])
  const [furnitureChangeRequests, setFurnitureChangeRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedRequestId, setSelectedRequestId] = useState("")
  const [selectedContract, setSelectedContract] = useState<BackendContract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [contractBusy, setContractBusy] = useState(false)
  const [contractError, setContractError] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  
  // Modals for Maintenance/Furniture
  const [selectedFurniture, setSelectedFurniture] = useState<any>(null)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [furnitureModalType, setFurnitureModalType] = useState<"suggestion" | "change">("suggestion")
  const [isFurnitureModalOpen, setIsFurnitureModalOpen] = useState(false)

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
        const [rentalData, notificationsData, furnSuggestions, furnChanges] = await Promise.all([
          fetchRentalRequests(token),
          http.get<any[]>("/notifications", token),
          http.get<any[]>("/furniture/my-suggestions", token).catch(() => []),
          http.get<any[]>("/furniture/owner-change-requests", token).catch(() => [])
        ])
        
        if (active) {
          setRequests(rentalData)
          const reclamations = Array.isArray(notificationsData)
            ? notificationsData.filter((n: any) => n.type === 'Reclamation' || n.type === 'Réclamation')
            : []
          setMaintenanceRequests(reclamations)
          setFurnitureSuggestions(Array.isArray(furnSuggestions) ? furnSuggestions : [])
          setFurnitureChangeRequests(Array.isArray(furnChanges) ? furnChanges : [])
        }
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

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === "En attente").length,
    accepted: requests.filter(r => r.status === "Acceptée").length,
    rejected: requests.filter(r => r.status === "Refusée").length,
    contractGenerated: requests.filter(r => r.status === "Contrat généré").length,
    active: requests.filter(r => r.status === "Contrat actif").length,
    maintenance: maintenanceRequests.length,
    furniture: furnitureSuggestions.length + furnitureChangeRequests.length,
    payments: 6, // matching web mock count
  }), [requests, maintenanceRequests, furnitureSuggestions, furnitureChangeRequests])

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

  const handleOpenMaintenanceDetail = (item: any) => {
    setSelectedMaintenance(item)
    setIsMaintenanceModalOpen(true)
  }

  const handleOpenFurnitureDetail = (item: any, type: "suggestion" | "change") => {
    setSelectedFurniture(item)
    setFurnitureModalType(type)
    setIsFurnitureModalOpen(true)
  }

  const openRequestDetail = async (request: any) => {
    if (request.type === 'Reclamation' || request.type === 'Réclamation') {
      handleOpenMaintenanceDetail(request)
      return
    }
    
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
        alert("Contrat renvoyé au locateur !")
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

  const renderRentalSection = () => (
    <div className="request-list-grid">
      {requests.filter(r => activeTab === "all" || r.status === activeTab).length === 0 ? (
        <EmptyState icon={documentTextOutline} title="Aucune demande" message="Aucune demande de location dans cette catégorie." />
      ) : (
        requests.filter(r => activeTab === "all" || r.status === activeTab).map((request) => (
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
        ))
      )}
    </div>
  )

  const renderMaintenanceSection = () => (
    <div className="request-list-grid">
      {maintenanceRequests.length === 0 ? (
        <EmptyState icon={constructOutline} title="Aucune maintenance" message="Aucune demande de maintenance reçue." />
      ) : (
        maintenanceRequests.map((item) => (
          <button key={item._id} type="button" className="request-card request-card-button" onClick={() => {
            setSelectedMaintenance(item)
            setIsMaintenanceModalOpen(true)
          }}>
            <div className="request-card-top">
              <div>
                <h4 style={{ color: '#0891b2' }}>{item.title}</h4>
                <p>{item.claimMeta?.propertyTitle || "Maintenance"}</p>
              </div>
              <span className={`request-status ${item.status === 'Resolue' || item.status === 'Résolue' ? 'approved' : 'pending'}`}>
                <IonIcon icon={item.status === 'Resolue' || item.status === 'Résolue' ? checkmarkCircleOutline : timeOutline} />
                {item.status}
              </span>
            </div>
            <p className="request-card-meta" style={{ marginTop: '8px', color: '#64748b' }}>
              <IonIcon icon={personOutline} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {item.claimMeta?.tenantName || "Locataire"}
            </p>
            <p className="request-card-meta" style={{ color: '#94a3b8', fontSize: '11px' }}>
              {formatDate(item.createdAt)}
            </p>
            <div className="request-card-footer" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '12px', fontWeight: '800', color: '#0891b2' }}>Consulter & Répondre</span>
               {item.claimMeta?.priority && (
                 <span style={{ 
                   fontSize: '10px', fontWeight: '900', padding: '3px 10px', borderRadius: '12px', 
                   background: item.claimMeta.priority === 'High' || item.claimMeta.priority === 'Urgent' ? '#fee2e2' : '#ecfeff',
                   color: item.claimMeta.priority === 'High' || item.claimMeta.priority === 'Urgent' ? '#ef4444' : '#0891b2'
                 }}>
                   {item.claimMeta.priority}
                 </span>
               )}
            </div>
          </button>
        ))
      )}
    </div>
  )

  const renderFurnitureSection = () => (
    <div className="request-list-grid">
      {furnitureSuggestions.length === 0 && furnitureChangeRequests.length === 0 ? (
        <EmptyState icon={cartOutline} title="Aucun mobilier" message="Aucune demande liée au mobilier." />
      ) : (
        <>
          {furnitureChangeRequests.map((item) => (
            <button key={item._id} type="button" className="request-card request-card-button" onClick={() => {
              setSelectedFurniture(item)
              setFurnitureModalType("change")
              setIsFurnitureModalOpen(true)
            }}>
              <div className="request-card-top">
                <div>
                  <h4 style={{ color: '#ea580c' }}>{item.furnitureName}</h4>
                  <p>Demande de changement</p>
                </div>
                <span className={`request-status ${item.status === 'Approuvé' || item.status === 'Terminé' ? 'approved' : 'pending'}`}>
                  {item.status}
                </span>
              </div>
              <p className="request-card-meta">{item.propertyId?.title || "..."}</p>
              <div className="request-card-footer" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ea580c' }}>Voir les détails</span>
                <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 10px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c' }}>
                  {item.type}
                </span>
              </div>
            </button>
          ))}
          {furnitureSuggestions.map((item) => (
            <button key={item._id} type="button" className="request-card request-card-button" onClick={() => {
              setSelectedFurniture(item)
              setFurnitureModalType("suggestion")
              setIsFurnitureModalOpen(true)
            }}>
              <div className="request-card-top">
                <div>
                  <h4 style={{ color: '#64748b' }}>{item.name}</h4>
                  <p>Suggestion au catalogue</p>
                </div>
                <span className={`request-status ${item.status === 'approved' ? 'approved' : 'pending'}`}>
                  {item.status === 'approved' ? 'Approuvé' : 'En attente'}
                </span>
              </div>
              <p className="request-card-meta">{item.price} DT</p>
            </button>
          ))}
        </>
      )}
    </div>
  )

  const renderPaymentsSection = () => (
    <div className="request-list-grid">
      {mockPayments.map((payment) => (
        <div key={payment.id} className="request-card" style={{ background: '#fff' }}>
          <div className="request-card-top">
            <div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>{payment.reference}</span>
              <h4 style={{ marginTop: '4px' }}>{payment.propertyTitle}</h4>
            </div>
            <span className={`request-status ${payment.status === 'Payé' ? 'approved' : payment.status === 'Refusé' ? 'rejected' : 'pending'}`}>
              {payment.status}
            </span>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
             <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{payment.tenantName}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{formatDate(payment.date)} • {payment.method}</p>
             </div>
             <span style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>{payment.amount} DT</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    if (!isOwner) return renderRentalSection()
    
    switch (activeTab) {
      case "maintenance": return renderMaintenanceSection()
      case "furniture": return renderFurnitureSection()
      case "payments": return renderPaymentsSection()
      case "all": 
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ padding: '0 20px' }}>
               <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '16px' }}>Maintenance</h3>
               {renderMaintenanceSection()}
            </div>
            <div style={{ padding: '0 20px' }}>
               <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '16px' }}>Mobilier</h3>
               {renderFurnitureSection()}
            </div>
            <div style={{ padding: '0 20px' }}>
               <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '16px' }}>Locations</h3>
               {renderRentalSection()}
            </div>
          </div>
        )
      default: return renderRentalSection()
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page rental-requests-page">
          <SectionHeader
            badge={isOwner ? "Locateur" : "Locataire"}
            title="Demandes"
            subtitle={
              isOwner
                ? "Gérez l'ensemble de vos demandes : locations, maintenance et mobilier."
                : "Suivez l'état de vos demandes de location et réclamations."}
          />

          {isOwner && (
            <>
              {/* Stats Cards Scrollable */}
              <div className="stats-cards-scroll" style={{ display: 'flex', overflowX: 'auto', padding: '0 20px 20px', gap: '12px' }}>
                {[
                  { key: "all", label: "Total", value: stats.total, icon: statsChartOutline, color: "#1e293b", bg: "#f8fafc" },
                  { key: "En attente", label: "Attente", value: stats.pending, icon: timerOutline, color: "#d97706", bg: "#fffbeb" },
                  { key: "maintenance", label: "Maintenance", value: stats.maintenance, icon: constructOutline, color: "#0891b2", bg: "#ecfeff" },
                  { key: "furniture", label: "Mobilier", value: stats.furniture, icon: cartOutline, color: "#ea580c", bg: "#fff7ed" },
                  { key: "Contrat actif", label: "Contrats", value: stats.contractGenerated + stats.active, icon: documentTextOutline, color: "#2563eb", bg: "#eff6ff" },
                  { key: "payments", label: "Paiements", value: stats.payments, icon: cashOutline, color: "#059669", bg: "#ecfdf5" },
                ].map(card => (
                  <button 
                    key={card.key}
                    onClick={() => setActiveTab(card.key)}
                    style={{ 
                      flexShrink: 0, width: '120px', padding: '16px', borderRadius: '20px', border: '1px solid #eee',
                      background: card.bg, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px',
                      boxShadow: activeTab === card.key ? `0 4px 12px ${card.color}20` : 'none',
                      borderColor: activeTab === card.key ? card.color : '#eee'
                    }}
                  >
                    <div style={{ background: '#fff', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                       <IonIcon icon={card.icon} style={{ color: card.color, fontSize: '18px', margin: 'auto' }} />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>{card.value}</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{card.label}</span>
                  </button>
                ))}
              </div>

              {/* Filter Tabs */}
              <div className="filter-tabs-scroll" style={{ display: 'flex', overflowX: 'auto', padding: '0 20px 20px', gap: '8px' }}>
                {[
                  { key: "all", label: "Toutes", count: stats.total },
                  { key: "En attente", label: "En attente", count: stats.pending },
                  { key: "maintenance", label: "Maintenance", count: stats.maintenance },
                  { key: "furniture", label: "Mobilier", count: stats.furniture },
                  { key: "Acceptée", label: "Acceptées", count: stats.accepted },
                  { key: "Refusée", label: "Refusées", count: stats.rejected },
                  { key: "Contrat actif", label: "Actifs", count: stats.active },
                  { key: "payments", label: "Paiements", count: stats.payments },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flexShrink: 0, padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', border: '1px solid',
                      background: activeTab === tab.key ? '#2563eb' : '#fff',
                      color: activeTab === tab.key ? '#fff' : '#64748b',
                      borderColor: activeTab === tab.key ? '#2563eb' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {tab.label}
                    <span style={{ 
                      fontSize: '10px', background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9', 
                      padding: '2px 6px', borderRadius: '6px', color: activeTab === tab.key ? '#fff' : '#475569' 
                    }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {loading ? (
            <LoadingSpinner message="Chargement des demandes..." />
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : requests.length === 0 && maintenanceRequests.length === 0 && furnitureSuggestions.length === 0 && furnitureChangeRequests.length === 0 ? (
            <EmptyState
              icon={documentTextOutline}
              title="Aucune demande"
              message={isOwner ? "Vous n'avez pas encore reçu de demandes." : "Vous n'avez pas encore soumis de demandes."}
            />
          ) : !selectedRequestId ? (
            renderContent()
          ) : selectedRequest ? (
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
                  <h3>Discussion avec le {isOwner ? "locataire" : "locateur"}</h3>
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
                    <div className="request-contract-info">
                      <div className="request-contract-id">
                        <IonIcon icon={documentTextOutline} />
                        <div>
                          <span className="request-contract-label">ID Contrat</span>
                          <strong>#{selectedContract._id.slice(-8).toUpperCase()}</strong>
                        </div>
                      </div>
                      <div className="contract-header-actions">
                        <button className="mini-tool-btn" onClick={handleDownloadPdf} disabled={isDownloading}>
                          <IonIcon icon={downloadOutline} />
                          {isDownloading ? "..." : "PDF"}
                        </button>
                      </div>
                    </div>
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
                  </div>

                  <div style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
                    <MobileSignaturePad 
                      label="Signature du Locateur"
                      existingSignature={selectedContract.ownerSignature}
                      onSign={handleSignContract}
                      disabled={!isOwner || selectedContract.status !== "Draft"}
                    />
                    
                    <MobileSignaturePad 
                      label="Signature du Locataire"
                      existingSignature={selectedContract.tenantSignature}
                      onSign={handleSignContract}
                      disabled={isOwner || selectedContract.status !== "SentToTenant"}
                    />
                  </div>
                  
                  {isOwner && selectedContract.status === "Draft" && (
                    <button 
                      className="action-btn" 
                      onClick={handleSendContract} 
                      disabled={actionBusy === selectedContract._id || !selectedContract.ownerSignature}
                      style={{ opacity: !selectedContract.ownerSignature ? 0.6 : 1, marginTop: '20px' }}
                    >
                       <IonIcon icon={sendOutline} />
                       {actionBusy === selectedContract._id ? "Envoi..." : "Envoyer pour signature"}
                    </button>
                  )}
                  
                  {isOwner && !selectedContract.ownerSignature && selectedContract.status === "Draft" && (
                    <p style={{ fontSize: '10px', color: '#ef4444', textAlign: 'center', marginTop: '4px', fontWeight: 'bold' }}>
                      * Veuillez signer le contrat avant de l'envoyer
                    </p>
                  )}

                  {isOwner && selectedContract.status === "SignedByBoth" ? (
                    <button className="action-btn" onClick={handleFinalActivate} disabled={actionBusy === selectedContract._id} style={{ marginTop: '20px' }}>
                       <IonIcon icon={checkmarkCircleOutline} />
                       {actionBusy === selectedContract._id ? "Activation..." : "Activer le contrat"}
                    </button>
                  ) : null}

                  {!isOwner && selectedContract.status === "SignedByTenant" ? (
                    <button className="action-btn" onClick={handleSendContract} disabled={actionBusy === selectedContract._id} style={{ marginTop: '20px' }}>
                       <IonIcon icon={sendOutline} />
                       {actionBusy === selectedContract._id ? "Envoi..." : "Renvoyer signé au locateur"}
                    </button>
                  ) : null}

                  {/* Hidden PDF Content for generation */}
                  <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <MobilePdfLayout
                      id="mobile-contract-pdf-content"
                      title="Contrat de Location"
                      documentId={selectedContract._id}
                      date={new Date(selectedContract.createdAt).toLocaleDateString("fr-FR")}
                      infoLeft={
                        <div style={{ padding: '10px' }}>
                           <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Locateur</p>
                           <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a8a', margin: '4px 0' }}>{selectedContract.ownerName || "Bailleur"}</p>
                           <p style={{ fontSize: '12px', color: '#64748b' }}>{selectedContract.ownerEmail || "-"}</p>
                        </div>
                      }
                      infoRight={
                        <div style={{ padding: '10px', textAlign: 'right' }}>
                           <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Locataire</p>
                           <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a8a', margin: '4px 0' }}>{selectedContract.tenantName || "Preneur"}</p>
                           <p style={{ fontSize: '12px', color: '#64748b' }}>{selectedContract.tenantEmail || "-"}</p>
                        </div>
                      }
                    >
                      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                         <h3 style={{ fontSize: '18px', borderBottom: '2px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a' }}>Conditions du Contrat</h3>
                         <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                               <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Loyer Mensuel</p>
                               <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0' }}>{selectedContract.monthlyRent || selectedContract.rentAmount} TND</p>
                            </div>
                            <div>
                               <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Caution</p>
                               <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0' }}>{selectedContract.depositAmount || (selectedContract.monthlyRent * 2)} TND</p>
                            </div>
                         </div>

                         <div style={{ marginTop: '25px' }}>
                            <h4 style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '10px' }}>Signatures</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                               <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '10px', minHeight: '100px' }}>
                                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>Locateur</p>
                                  {selectedContract.ownerSignature && (
                                    <img src={selectedContract.ownerSignature} alt="Owner Sign" style={{ width: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                                  )}
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '10px', minHeight: '100px' }}>
                                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>Locataire</p>
                                  {selectedContract.tenantSignature && (
                                    <img src={selectedContract.tenantSignature} alt="Tenant Sign" style={{ width: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                                  )}
                                </div>
                            </div>
                         </div>
                      </div>
                    </MobilePdfLayout>
                  </div>
                </section>
              ) : null}
              </div>
            </>
          ) : null}
        </div>

        {/* Maintenance Response Modal */}
        <IonModal isOpen={isMaintenanceModalOpen} onDidDismiss={() => setIsMaintenanceModalOpen(false)} className="immosmart-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Détails Maintenance</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsMaintenanceModalOpen(false)}>Fermer</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedMaintenance && (
              <MaintenanceDetailContent 
                request={selectedMaintenance} 
                token={token || ""} 
                onUpdated={(updated) => {
                  setMaintenanceRequests(prev => prev.map(m => m._id === updated._id ? updated : m))
                  setSelectedMaintenance(updated)
                }}
              />
            )}
          </IonContent>
        </IonModal>

        {/* Furniture Detail Modal */}
        <IonModal isOpen={isFurnitureModalOpen} onDidDismiss={() => setIsFurnitureModalOpen(false)} className="immosmart-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>{furnitureModalType === "change" ? "Demande Mobilier" : "Détails Suggestion"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsFurnitureModalOpen(false)}>Fermer</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedFurniture && (
              <FurnitureDetailContent 
                request={selectedFurniture} 
                type={furnitureModalType}
                token={token || ""}
                onUpdated={(updated) => {
                  if (furnitureModalType === "change") {
                    setFurnitureChangeRequests(prev => prev.map(f => f._id === updated._id ? updated : f))
                  } else {
                    setFurnitureSuggestions(prev => prev.map(f => f._id === updated._id ? updated : f))
                  }
                  setSelectedFurniture(updated)
                }}
              />
            )}
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  )
}

// ─── Sub-Components for Modals ────────────────────────────────────────────────

const MaintenanceDetailContent: React.FC<{ request: any, token: string, onUpdated: (u: any) => void }> = ({ request, token, onUpdated }) => {
  const [msg, setMsg] = useState("")
  const [status, setStatus] = useState(request.status || "En attente")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [tech, setTech] = useState("")
  const [busy, setBusy] = useState(false)

  const handleRespond = async () => {
    setBusy(true)
    try {
      const response = await http.put<any>(`/notifications/reclamations/${request._id}/respond`, {
        status,
        responseMessage: msg,
        intervention: date ? { date, time, technician: tech } : undefined
      }, token)
      onUpdated(response)
      alert("Réponse enregistrée !")
    } catch (err) {
      alert("Erreur lors de la réponse")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 4px' }}>{request.title}</h3>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{request.claimMeta?.propertyTitle}</span>
        
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#334155', fontStyle: 'italic', background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
           "{request.content.split('\n\n').pop()}"
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <IonItem lines="none" style={{ '--background': '#f1f5f9', borderRadius: '12px' }}>
          <IonLabel position="stacked" style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}>Statut de la demande</IonLabel>
          <IonSelect value={status} onIonChange={e => setStatus(e.detail.value)}>
            <IonSelectOption value="En attente">En attente</IonSelectOption>
            <IonSelectOption value="En cours">En cours</IonSelectOption>
            <IonSelectOption value="Resolue">Résolue</IonSelectOption>
            <IonSelectOption value="Refusee">Refusée</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem lines="none" style={{ '--background': '#f1f5f9', borderRadius: '12px' }}>
          <IonLabel position="stacked" style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}>Message au locataire</IonLabel>
          <IonTextarea value={msg} onIonChange={e => setMsg(e.detail.value || "")} placeholder="Expliquez la suite..." rows={4} />
        </IonItem>

        <div style={{ padding: '8px 4px' }}>
           <h4 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 12px' }}>Planifier une intervention</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <IonItem lines="none" style={{ '--background': '#f1f5f9', borderRadius: '12px' }}>
                 <IonInput type="date" value={date} onIonChange={e => setDate(e.detail.value || "")} />
              </IonItem>
              <IonItem lines="none" style={{ '--background': '#f1f5f9', borderRadius: '12px' }}>
                 <IonInput type="time" value={time} onIonChange={e => setTime(e.detail.value || "")} />
              </IonItem>
           </div>
           <IonItem lines="none" style={{ '--background': '#f1f5f9', borderRadius: '12px', marginTop: '10px' }}>
              <IonInput placeholder="Technicien / Entreprise" value={tech} onIonChange={e => setTech(e.detail.value || "")} />
           </IonItem>
        </div>

        <button 
          onClick={handleRespond} 
          disabled={busy}
          style={{ 
            marginTop: '10px', width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: '#0891b2', color: '#fff', fontWeight: '800', fontSize: '15px',
            boxShadow: '0 10px 20px rgba(8,145,178,0.2)'
          }}
        >
          {busy ? "Enregistrement..." : "Enregistrer la réponse"}
        </button>
      </div>
    </div>
  )
}

const FurnitureDetailContent: React.FC<{ request: any, type: "suggestion" | "change", token: string, onUpdated: (u: any) => void }> = ({ request, type, token, onUpdated }) => {
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  const handleReview = async (status: string) => {
    setBusy(true)
    try {
      const response = await http.put<any>(`/furniture/change-requests/${request._id}/review`, {
        status,
        ownerResponse: msg
      }, token)
      onUpdated(response)
      alert(status === "Approuve" ? "Demande acceptée !" : "Réponse envoyée")
    } catch (err) {
      alert("Erreur lors de la validation")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ position: 'relative', height: '220px', borderRadius: '24px', overflow: 'hidden', marginBottom: '20px' }}>
        <IonImg src={request.photo || request.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px' }}>
           <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', margin: 0 }}>{request.furnitureName || request.name}</h3>
           <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '700' }}>{request.type || request.category}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
           <h4 style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Description / Motif</h4>
           <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{request.reason || request.description}</p>
        </div>

        {type === "change" && (
          <div style={{ display: 'grid', gap: '12px' }}>
             <IonItem lines="none" style={{ '--background': '#f1f5f9', borderRadius: '12px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}>Réponse au locataire</IonLabel>
                <IonTextarea value={msg} onIonChange={e => setMsg(e.detail.value || "")} placeholder="Ecrivez votre message..." rows={4} />
             </IonItem>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={() => handleReview("Refuse")} 
                  disabled={busy}
                  style={{ 
                    padding: '14px', borderRadius: '14px', border: '1.5px solid #fecaca',
                    background: '#fef2f2', color: '#dc2626', fontWeight: '800', fontSize: '14px'
                  }}
                >
                  Refuser
                </button>
                <button 
                  onClick={() => handleReview("Approuve")} 
                  disabled={busy}
                  style={{ 
                    padding: '14px', borderRadius: '14px', border: 'none',
                    background: '#059669', color: '#fff', fontWeight: '800', fontSize: '14px',
                    boxShadow: '0 8px 16px rgba(5,150,105,0.2)'
                  }}
                >
                  Accepter
                </button>
             </div>
             
             <button 
                onClick={() => handleReview("En attente")} 
                disabled={busy || !msg.trim()}
                style={{ 
                  padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0',
                  background: '#fff', color: '#2563eb', fontWeight: '800', fontSize: '14px'
                }}
              >
                Envoyer le message
              </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RentalRequestsPage
