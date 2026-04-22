import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchRentalRequests } from "../lib/rental-api"
import { createFurnitureChangeRequest, fetchFurniture, saveFurnitureOrder } from "../lib/furniture-api"
import type { BackendFurniture, BackendRentalRequest } from "../types/api"
import "../theme/mobile-theme.css"

type CartItem = {
  furniture: BackendFurniture
  quantity: number
}

const changeTypes = ["Remplacement", "Ajout", "Suppression", "Reparation", "Echange"]

const FurniturePage: React.FC = () => {
  const { token, user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [catalogue, setCatalogue] = useState<BackendFurniture[]>([])
  const [requests, setRequests] = useState<BackendRentalRequest[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [orderBusy, setOrderBusy] = useState(false)
  const [lastOrderId, setLastOrderId] = useState("")
  const [changeBusy, setChangeBusy] = useState(false)
  const [changeFurnitureId, setChangeFurnitureId] = useState("")
  const [changeType, setChangeType] = useState(changeTypes[0])
  const [changeReason, setChangeReason] = useState("")
  const [changeDescription, setChangeDescription] = useState("")

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const [furnitureData, requestsData] = await Promise.all([fetchFurniture(token), fetchRentalRequests(token)])
        if (!active) return
        setCatalogue(furnitureData)
        setRequests(requestsData)
        const defaultPropertyId = requestsData
          .map((req) => (typeof req.property === "string" ? req.property : req.property?._id || ""))
          .find(Boolean)
        setSelectedPropertyId(defaultPropertyId || "")
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erreur chargement ameublement")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [token])

  const rentalOptions = useMemo(() => {
    return requests.map((req) => {
      const propertyObj = typeof req.property === "string" ? null : req.property
      const propertyId = typeof req.property === "string" ? req.property : propertyObj?._id || ""
      return {
        requestId: req._id,
        propertyId,
        label: propertyObj?.title || `Bien ${propertyId.slice(-6)}`,
        status: req.status || "En attente",
      }
    })
  }, [requests])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.furniture.price || 0) * item.quantity, 0),
    [cartItems],
  )
  const availableForChange = useMemo(() => cartItems.map((item) => item.furniture), [cartItems])

  const setQuantity = (furniture: BackendFurniture, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[furniture._id]
        return next
      }
      return {
        ...prev,
        [furniture._id]: { furniture, quantity },
      }
    })
  }

  const handleSubmitOrder = async () => {
    if (!token) return
    if (!selectedPropertyId) {
      setError("Selectionnez d'abord un bien concerne.")
      return
    }
    if (cartItems.length === 0) {
      setError("Ajoutez au moins un meuble au panier.")
      return
    }

    setOrderBusy(true)
    setError("")
    setSuccess("")

    try {
      const payloadItems = cartItems.map((item) => ({
        furniture: item.furniture._id,
        quantity: item.quantity,
        price: item.furniture.price,
      }))

      const createdOrder = await saveFurnitureOrder(
        {
          propertyId: selectedPropertyId,
          items: payloadItems,
          total: cartTotal,
          paymentMethod: "cash",
        },
        token,
      )

      setLastOrderId(createdOrder._id)
      setChangeFurnitureId(payloadItems[0]?.furniture || "")
      setSuccess("Commande enregistree avec succes.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer la commande")
    } finally {
      setOrderBusy(false)
    }
  }

  const handleSubmitChangeRequest = async () => {
    if (!token) return
    if (!selectedPropertyId) {
      setError("Selectionnez un bien avant d'envoyer une demande.")
      return
    }
    if (!changeFurnitureId) {
      setError("Choisissez un meuble pour la demande de changement.")
      return
    }
    if (!changeReason.trim()) {
      setError("La raison de la demande est obligatoire.")
      return
    }

    setChangeBusy(true)
    setError("")
    setSuccess("")

    try {
      await createFurnitureChangeRequest(
        {
          furnitureId: changeFurnitureId,
          contractId: lastOrderId || undefined,
          propertyId: selectedPropertyId,
          type: changeType,
          reason: changeReason.trim(),
          description: changeDescription.trim() || undefined,
        },
        token,
      )

      setChangeReason("")
      setChangeDescription("")
      setSuccess("Demande de changement envoyee. Le proprietaire a ete notifie.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer la demande de changement")
    } finally {
      setChangeBusy(false)
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" icon="arrow-back-outline" />
          </IonButtons>
          <IonTitle className="font-title">Ameublement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page" style={{ display: "grid", gap: "14px", paddingBottom: "24px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 8px", color: "#1e3a8a" }}>Commande mobilier locataire</h3>
            <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: "14px" }}>
              Bonjour {user?.name || "Locataire"}, choisissez vos meubles puis passez commande.
            </p>
            <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#334155" }}>
              Bien concerne
            </label>
            <select
              value={selectedPropertyId}
              onChange={(event) => setSelectedPropertyId(event.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            >
              <option value="">Selectionner un bien</option>
              {rentalOptions.map((option) => (
                <option key={`${option.requestId}-${option.propertyId}`} value={option.propertyId}>
                  {option.label} ({option.status})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#64748b" }}>Chargement du catalogue...</div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {catalogue.map((item) => {
                const quantity = cart[item._id]?.quantity || 0
                return (
                  <article
                    key={item._id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      padding: "12px",
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                      <div>
                        <h4 style={{ margin: 0, color: "#0f172a" }}>{item.name}</h4>
                        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>{item.category}</p>
                      </div>
                      <strong style={{ color: "#1e3a8a" }}>{item.price} TND</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setQuantity(item, quantity - 1)}
                        style={{ border: "1px solid #cbd5e1", borderRadius: "8px", width: "34px", height: "34px" }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: "24px", textAlign: "center" }}>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item, quantity + 1)}
                        style={{ border: "1px solid #cbd5e1", borderRadius: "8px", width: "34px", height: "34px" }}
                      >
                        +
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div style={{ background: "white", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 8px", color: "#1e3a8a" }}>Panier</h3>
            <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "14px" }}>
              {cartItems.length} article(s) - Total: {cartTotal.toFixed(2)} TND
            </p>
            <button
              type="button"
              disabled={orderBusy || cartItems.length === 0 || !selectedPropertyId}
              onClick={handleSubmitOrder}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "#1e3a8a",
                color: "white",
                fontWeight: 700,
                opacity: orderBusy || cartItems.length === 0 || !selectedPropertyId ? 0.6 : 1,
              }}
            >
              {orderBusy ? "Enregistrement..." : "Confirmer ma commande"}
            </button>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 8px", color: "#1e3a8a" }}>Demande de changement</h3>
            <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: "14px" }}>
              Signalez un meuble a remplacer, reparer ou changer. Le proprietaire recevra une notification.
            </p>

            <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#334155" }}>
              Meuble
            </label>
            <select
              value={changeFurnitureId}
              onChange={(event) => setChangeFurnitureId(event.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                marginBottom: "8px",
              }}
            >
              <option value="">Choisir un meuble</option>
              {availableForChange.map((furniture) => (
                <option key={furniture._id} value={furniture._id}>
                  {furniture.name}
                </option>
              ))}
            </select>

            <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#334155" }}>
              Type de demande
            </label>
            <select
              value={changeType}
              onChange={(event) => setChangeType(event.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                marginBottom: "8px",
              }}
            >
              {changeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <textarea
              value={changeReason}
              onChange={(event) => setChangeReason(event.target.value)}
              placeholder="Raison (obligatoire)"
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                marginBottom: "8px",
              }}
            />

            <textarea
              value={changeDescription}
              onChange={(event) => setChangeDescription(event.target.value)}
              placeholder="Details supplementaires (optionnel)"
              style={{
                width: "100%",
                minHeight: "70px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                marginBottom: "12px",
              }}
            />

            <button
              type="button"
              disabled={changeBusy || !selectedPropertyId || !changeFurnitureId || !changeReason.trim()}
              onClick={handleSubmitChangeRequest}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "#0f766e",
                color: "white",
                fontWeight: 700,
                opacity: changeBusy || !selectedPropertyId || !changeFurnitureId || !changeReason.trim() ? 0.6 : 1,
              }}
            >
              {changeBusy ? "Envoi..." : "Envoyer ma demande"}
            </button>
          </div>

          {error && (
            <div
              style={{ background: "#fee2e2", color: "#991b1b", borderRadius: "10px", padding: "10px", fontSize: "14px" }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{ background: "#dcfce7", color: "#166534", borderRadius: "10px", padding: "10px", fontSize: "14px" }}
            >
              {success}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default FurniturePage
