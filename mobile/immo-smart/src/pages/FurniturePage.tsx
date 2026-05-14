import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import {
  addOutline,
  arrowBackOutline,
  bagHandleOutline,
  bedOutline,
  cameraOutline,
  cartOutline,
  closeOutline,
  cubeOutline,
  eyeOutline,
  filterOutline,
  homeOutline,
  listOutline,
  mailOpenOutline,
  removeOutline,
  sparklesOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import MobileFurnitureReceipt from "../components/MobileFurnitureReceipt"
import { useAuth } from "../lib/auth-context"
import {
  addFurnitureItem,
  createFurnitureChangeRequest,
  fetchFurniture,
  fetchFurnitureByProperty,
  fetchTenantFurnitureOrders,
  getFurnitureFallbackImage,
  saveFurnitureOrder,
  type MobileFurnitureItem,
} from "../lib/furniture-api"
import { fetchMyRentals, fetchProperties } from "../lib/property-api"
import type { BackendFurnitureOrder, BackendProperty } from "../types/api"
import "../theme/mobile-theme.css"

type CartItem = {
  furniture: MobileFurnitureItem
  quantity: number
}

type ReceiptOrder = {
  id: string
  propertyId: string
  propertyName: string
  date: string
  items: Array<{
    id: string
    name: string
    category: string
    quantity: number
    price: number
  }>
  total: number
  paymentMethod: string
  status: string
}

const categories = ["Tous", "Salon", "Chambre", "Salle à manger", "Cuisine", "Décoration", "Bureau"] as const
const changeTypes = ["Changement", "Remplacement", "Ajout", "Suppression", "Réparation", "Echange"]

const isMongoObjectId = (value?: string) => Boolean(value && /^[a-f\d]{24}$/i.test(value))

const FurniturePage: React.FC = () => {
  const { token, user } = useAuth()
  const location = useLocation()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [view, setView] = useState<"catalog" | "receipt">("catalog")
  const [loading, setLoading] = useState(false)
  const [existingLoading, setExistingLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [catalogue, setCatalogue] = useState<MobileFurnitureItem[]>([])
  const [rentals, setRentals] = useState<BackendProperty[]>([])
  const [orders, setOrders] = useState<BackendFurnitureOrder[]>([])
  const [existingFurniture, setExistingFurniture] = useState<Array<MobileFurnitureItem & { quantity?: number }>>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("Tous")
  const [selectedFurniture, setSelectedFurniture] = useState<MobileFurnitureItem | null>(null)
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [orderBusy, setOrderBusy] = useState(false)
  const [changeBusy, setChangeBusy] = useState(false)
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)
  const [changeFurnitureName, setChangeFurnitureName] = useState("")
  const [changeFurnitureId, setChangeFurnitureId] = useState("")
  const [changeType, setChangeType] = useState(changeTypes[0])
  const [changeReason, setChangeReason] = useState("")
  const [changeDescription, setChangeDescription] = useState("")
  const [changePhoto, setChangePhoto] = useState("")
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptOrder | null>(null)
  
  // Propose Furniture (Owner)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newFurniture, setNewFurniture] = useState({
    name: "",
    category: "Salon",
    price: 0,
    description: "",
    image: ""
  })
  const addPhotoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const requestedPropertyId = new URLSearchParams(location.search).get("property") || ""
    if (requestedPropertyId) {
      setSelectedPropertyId(requestedPropertyId)
    }
  }, [location.search])

  useEffect(() => {
    if (!token || (user?.role !== "tenant" && user?.role !== "owner")) return

    let active = true
    const load = async () => {
      setLoading(true)
      try {
        setError("")
        const isOwner = user?.role === "owner"
        const [furnitureData, propertiesData, ordersData] = await Promise.all([
          fetchFurniture(token),
          isOwner ? fetchProperties(token) : fetchMyRentals(token),
          isOwner ? Promise.resolve([]) : fetchTenantFurnitureOrders(token),
        ])

        if (!active) return
        setCatalogue(furnitureData)
        setRentals(Array.isArray(propertiesData) ? propertiesData : [])
        setOrders(Array.isArray(ordersData) ? ordersData : [])

        const initialPropertyId =
          (Array.isArray(propertiesData) ? propertiesData[0]?._id : "") ||
          (Array.isArray(ordersData) ? String(ordersData[0]?.property || "") : "")
        setSelectedPropertyId(initialPropertyId)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erreur chargement ameublement")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [token, user?.role])

  useEffect(() => {
    if (!token || !selectedPropertyId) {
      setExistingFurniture([])
      return
    }

    let active = true
    const loadExistingFurniture = async () => {
      setExistingLoading(true)
      try {
        const data = await fetchFurnitureByProperty(selectedPropertyId, token)
        if (!active) return

        const normalized = (Array.isArray(data) ? data : []).map((item) => ({
          ...item,
          id: item.id || item._id,
          image: item.image || getFurnitureFallbackImage(item),
        }))
        setExistingFurniture(normalized)
      } catch {
        if (active) {
          setExistingFurniture([])
        }
      } finally {
        if (active) setExistingLoading(false)
      }
    }

    loadExistingFurniture()
    return () => {
      active = false
    }
  }, [selectedPropertyId, token])

  const selectedProperty = useMemo(
    () => rentals.find((property) => property._id === selectedPropertyId) || null,
    [rentals, selectedPropertyId]
  )

  const filteredCatalogue = useMemo(() => {
    const query = search.trim().toLowerCase()
    return catalogue.filter((item) => {
      const matchesCategory = selectedCategory === "Tous" || item.category === selectedCategory
      const matchesSearch =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [catalogue, search, selectedCategory])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.furniture.price * item.quantity, 0),
    [cartItems]
  )

  const mappedOrders = useMemo(
    () =>
      orders.map((order) => ({
        id: order._id,
        propertyId: typeof order.property === "string" ? order.property : "",
        propertyName:
          rentals.find((property) => property._id === (typeof order.property === "string" ? order.property : ""))?.title ||
          "Bien immobilier",
        date: new Date(order.createdAt || Date.now()).toLocaleDateString("fr-FR"),
        items: order.items.map((item, index) => {
          const furnitureObject = typeof item.furniture === "string" ? null : item.furniture
          return {
            id: furnitureObject?._id || `item-${index}`,
            name: furnitureObject?.name || "Mobilier",
            category: furnitureObject?.category || "Catalogue",
            quantity: item.quantity,
            price: item.price,
          }
        }),
        total: order.total,
        paymentMethod: order.paymentMethod || "cash",
        status: order.status || "Brouillon",
      })),
    [orders, rentals]
  )

  const setQuantity = (furniture: MobileFurnitureItem, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) {
        const next = { ...current }
        delete next[furniture.id]
        return next
      }

      return {
        ...current,
        [furniture.id]: { furniture, quantity },
      }
    })
  }

  const handleCheckout = async () => {
    if (!token) return
    if (!selectedPropertyId) {
      setError("Veuillez sélectionner un logement avant de confirmer la commande.")
      return
    }
    if (cartItems.length === 0) {
      setError("Ajoutez au moins un meuble au panier.")
      return
    }
    if (!paymentMethod.trim()) {
      setError("Veuillez sélectionner ou saisir un mode de paiement.")
      return
    }

    setOrderBusy(true)
    setError("")
    setSuccess("")

    try {
      const payloadItems = cartItems.map((item) => ({
        ...(isMongoObjectId(item.furniture._id) ? { furniture: item.furniture._id } : {}),
        name: item.furniture.name,
        category: item.furniture.category,
        quantity: item.quantity,
        price: item.furniture.price,
      }))

      const createdOrder = await saveFurnitureOrder(
        {
          propertyId: selectedPropertyId,
          items: payloadItems,
          total: cartTotal,
          paymentMethod,
        },
        token
      )

      const receipt: ReceiptOrder = {
        id: createdOrder._id,
        propertyId: selectedPropertyId,
        propertyName: selectedProperty?.title || "Bien immobilier",
        date: new Date(createdOrder.createdAt || Date.now()).toLocaleDateString("fr-FR"),
        items: cartItems.map((item) => ({
          id: item.furniture.id,
          name: item.furniture.name,
          category: item.furniture.category,
          quantity: item.quantity,
          price: item.furniture.price,
        })),
        total: cartTotal,
        paymentMethod,
        status: createdOrder.status || "Brouillon",
      }

      setOrders((current) => [createdOrder, ...current])
      setCurrentReceipt(receipt)
      setView("receipt")
      setCart({})
      setSuccess("Commande enregistrée avec succès.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de confirmer la commande.")
    } finally {
      setOrderBusy(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop volumineuse (max 5Mo).")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setChangePhoto(String(reader.result || ""))
    }
    reader.readAsDataURL(file)
  }

  const resetChangeForm = () => {
    setChangeFurnitureId("")
    setChangeFurnitureName("")
    setChangeType(changeTypes[0])
    setChangeReason("")
    setChangeDescription("")
    setChangePhoto("")
  }

  const handleSubmitChangeRequest = async () => {
    if (!token) return
    if (!selectedPropertyId) {
      setError("Veuillez sélectionner un logement avant d'envoyer votre demande.")
      return
    }
    if (!changeFurnitureName.trim() && !changeFurnitureId) {
      setError("Veuillez indiquer le meuble concerné.")
      return
    }
    if (!changeReason.trim()) {
      setError("Veuillez indiquer le motif.")
      return
    }

    setChangeBusy(true)
    setError("")
    setSuccess("")

    try {
      await createFurnitureChangeRequest(
        {
          ...(isMongoObjectId(changeFurnitureId) ? { furnitureId: changeFurnitureId } : {}),
          furnitureName: changeFurnitureName.trim() || undefined,
          propertyId: selectedPropertyId,
          type: changeType,
          reason: changeReason.trim(),
          description: changeDescription.trim() || undefined,
          photo: changePhoto || undefined,
        },
        token
      )

      setSuccess("Demande de changement envoyée avec succès.")
      resetChangeForm()
      setIsChangeModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer la demande de changement.")
    } finally {
      setChangeBusy(false)
    }
  }

  const handleAddPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setNewFurniture(prev => ({ ...prev, image: String(reader.result || "") }))
    }
    reader.readAsDataURL(file)
  }

  const handleProposeFurniture = async () => {
    if (!token) return
    if (!newFurniture.name.trim()) {
      setError("Veuillez entrer un nom pour l'article.")
      return
    }
    if (!newFurniture.image) {
      setError("Veuillez ajouter une image.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await addFurnitureItem(newFurniture, token)
      setSuccess("Votre proposition a été envoyée pour validation.")
      setIsAddModalOpen(false)
      setNewFurniture({ name: "", category: "Salon", price: 0, description: "", image: "" })
    } catch (err) {
      setError("Erreur lors de l'envoi de la proposition.")
    } finally {
      setLoading(false)
    }
  }

  const openOrderReceipt = (order: ReceiptOrder) => {
    setCurrentReceipt(order)
    setView("receipt")
  }

  if (view === "receipt" && currentReceipt) {
    return (
      <IonPage>
        <IonContent fullscreen className="mobile-content">
          <div className="mobile-page">
            <MobileFurnitureReceipt
              order={currentReceipt}
              property={selectedProperty}
              userName={user?.name}
              userEmail={user?.email}
              userPhone={user?.phone}
              onBack={() => setView("catalog")}
            />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" icon="arrow-back-outline" />
          </IonButtons>
          <IonTitle className="font-title">Mobilier</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page furniture-page">
          <section className="furniture-hero-card">
            <div className="furniture-hero-copy">
              <span className="furniture-hero-badge">
                <IonIcon icon={sparklesOutline} />
                Mobilier premium
              </span>
              <h1>{user?.role === 'owner' ? "Valorisez vos biens immobiliers." : "Équipez votre logement comme sur la version web."}</h1>
              <p>{user?.role === 'owner' ? "Proposez du mobilier de qualité pour attirer plus de locataires." : "Consultez le catalogue, achetez du mobilier, demandez un changement et récupérez votre bon PDF."}</p>
            </div>
            <div className="furniture-hero-actions">
              {user?.role === 'tenant' && (
                <button type="button" className="furniture-pill-btn" onClick={() => setIsChangeModalOpen(true)}>
                  <IonIcon icon={mailOpenOutline} />
                  Demande de changement
                </button>
              )}
              {user?.role === 'owner' && (
                <button type="button" className="furniture-pill-btn" onClick={() => setIsAddModalOpen(true)}>
                  <IonIcon icon={addOutline} />
                  Proposer un meuble
                </button>
              )}
            </div>
          </section>

          {loading ? <LoadingSpinner message="Chargement du mobilier..." /> : null}

          {!loading && error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : null}

          {!loading ? (
            <>


              <section className="furniture-panel">
                <div className="furniture-panel-header">
                  <div>
                    <h3>Catalogue</h3>
                    <p>Consultez tous les meubles disponibles comme sur le web.</p>
                  </div>
                  <span className="furniture-count-pill">{filteredCatalogue.length}</span>
                </div>

                <div className="search-input furniture-search-input">
                  <IonIcon icon={filterOutline} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher un meuble"
                  />
                </div>

                <div className="furniture-categories">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`furniture-category-chip ${selectedCategory === category ? "active" : ""}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {filteredCatalogue.length === 0 ? (
                  <EmptyState
                    icon={cubeOutline}
                    title="Aucun meuble trouvé"
                    message="Essayez une autre recherche ou catégorie."
                  />
                ) : (
                  <div className="furniture-catalog-grid">
                    {filteredCatalogue.map((item) => {
                      const quantity = cart[item.id]?.quantity || 0
                      return (
                        <article key={item.id} className="furniture-card">
                          <div className="furniture-card-media">
                            <img src={item.image || getFurnitureFallbackImage(item)} alt={item.name} />
                            <span>{item.category}</span>
                          </div>
                          <div className="furniture-card-body">
                            <div className="furniture-card-topline">
                              <h4>{item.name}</h4>
                              <strong>{item.price.toLocaleString("fr-TN")} DT</strong>
                            </div>
                            <p>{item.description || "Description indisponible."}</p>
                            <div className="furniture-card-actions">
                              <button type="button" className="furniture-secondary-btn" onClick={() => setSelectedFurniture(item)}>
                                <IonIcon icon={eyeOutline} />
                                Consulter
                              </button>
                              <div className="furniture-qty-controls">
                                <button type="button" onClick={() => setQuantity(item, quantity - 1)}>
                                  <IonIcon icon={removeOutline} />
                                </button>
                                <span>{quantity}</span>
                                <button type="button" onClick={() => setQuantity(item, quantity + 1)}>
                                  <IonIcon icon={addOutline} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="furniture-panel">
                <div className="furniture-panel-header">
                  <div>
                    <h3>Panier et achat</h3>
                    <p>Validez votre commande et affichez le bon PDF ensuite.</p>
                  </div>
                  <span className="furniture-count-pill">{cartItems.length}</span>
                </div>

                {cartItems.length === 0 ? (
                  <EmptyState
                    icon={cartOutline}
                    title="Panier vide"
                    message="Ajoutez du mobilier depuis le catalogue pour commencer."
                  />
                ) : (
                  <div className="furniture-cart-list">
                    {cartItems.map((item) => (
                      <article key={item.furniture.id} className="furniture-cart-item">
                        <img src={item.furniture.image || getFurnitureFallbackImage(item.furniture)} alt={item.furniture.name} />
                        <div className="furniture-cart-body">
                          <div className="furniture-card-topline">
                            <h4>{item.furniture.name}</h4>
                            <strong>{(item.furniture.price * item.quantity).toLocaleString("fr-TN")} DT</strong>
                          </div>
                          <p>{item.furniture.category}</p>
                          <div className="furniture-qty-controls">
                            <button type="button" onClick={() => setQuantity(item.furniture, item.quantity - 1)}>
                              <IonIcon icon={removeOutline} />
                            </button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => setQuantity(item.furniture, item.quantity + 1)}>
                              <IonIcon icon={addOutline} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <label className="furniture-field">
                  <span>Mode de paiement</span>
                  <input
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    placeholder="cash / cheque / virement"
                  />
                </label>

                <div className="furniture-total-box">
                  <div>
                    <span>Total mobilier</span>
                    <strong>{cartTotal.toLocaleString("fr-TN")} DT</strong>
                  </div>
                  <div>
                    <span>Livraison</span>
                    <strong>Offerte</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="furniture-primary-btn"
                  disabled={orderBusy || cartItems.length === 0 || !selectedPropertyId}
                  onClick={handleCheckout}
                >
                  <IonIcon icon={bagHandleOutline} />
                  {orderBusy ? "Validation..." : "Acheter maintenant"}
                </button>
              </section>

              <section className="furniture-panel">
                <div className="furniture-panel-header">
                  <div>
                    <h3>Historique des commandes</h3>
                    <p>Retrouvez vos achats et réouvrez le bon PDF.</p>
                  </div>
                  <span className="furniture-count-pill">{mappedOrders.length}</span>
                </div>

                {mappedOrders.length === 0 ? (
                  <EmptyState
                    icon={listOutline}
                    title="Aucune commande"
                    message="Vos futures commandes de mobilier apparaîtront ici."
                  />
                ) : (
                  <div className="furniture-orders-list">
                    {mappedOrders.map((order) => (
                      <article key={order.id} className="furniture-order-item">
                        <div>
                          <strong>#{order.id.slice(-6)}</strong>
                          <p>{order.propertyName}</p>
                          <span>{order.date}</span>
                        </div>
                        <div className="furniture-order-side">
                          <strong>{order.total.toLocaleString("fr-TN")} DT</strong>
                          <button type="button" className="furniture-secondary-btn" onClick={() => openOrderReceipt(order)}>
                            Voir le bon
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}

          {success ? (
            <div className="furniture-success-banner">{success}</div>
          ) : null}
        </div>

        {selectedFurniture ? (
          <div className="furniture-overlay" role="presentation" onClick={() => setSelectedFurniture(null)}>
            <div className="furniture-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="furniture-modal-close" onClick={() => setSelectedFurniture(null)}>
                <IonIcon icon={closeOutline} />
              </button>
              <img
                className="furniture-modal-image"
                src={selectedFurniture.image || getFurnitureFallbackImage(selectedFurniture)}
                alt={selectedFurniture.name}
              />
              <div className="furniture-modal-body">
                <div className="furniture-card-topline">
                  <h3>{selectedFurniture.name}</h3>
                  <strong>{selectedFurniture.price.toLocaleString("fr-TN")} DT</strong>
                </div>
                <span className="furniture-modal-category">{selectedFurniture.category}</span>
                <p>{selectedFurniture.description || "Aucune description disponible pour ce mobilier."}</p>
                <button
                  type="button"
                  className="furniture-primary-btn"
                  onClick={() => {
                    setQuantity(selectedFurniture, (cart[selectedFurniture.id]?.quantity || 0) + 1)
                    setSelectedFurniture(null)
                  }}
                >
                  <IonIcon icon={cartOutline} />
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isChangeModalOpen ? (
          <div className="furniture-overlay" role="presentation" onClick={() => setIsChangeModalOpen(false)}>
            <div className="furniture-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="furniture-modal-close" onClick={() => setIsChangeModalOpen(false)}>
                <IonIcon icon={closeOutline} />
              </button>
              <div className="furniture-modal-body">
                <h3>Demande de changement</h3>
                <p>Si un meuble ne convient pas ou est endommagé, envoyez une demande au locateur.</p>

                <label className="furniture-field">
                  <span>Meuble concerné</span>
                  <select
                    value={changeFurnitureId}
                    onChange={(event) => {
                      const selected = existingFurniture.find((item) => item.id === event.target.value || item._id === event.target.value)
                      setChangeFurnitureId(event.target.value)
                      setChangeFurnitureName(selected?.name || "")
                    }}
                  >
                    <option value="">Choisir un meuble existant</option>
                    {existingFurniture.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="furniture-field">
                  <span>Nom libre du meuble</span>
                  <input
                    value={changeFurnitureName}
                    onChange={(event) => setChangeFurnitureName(event.target.value)}
                    placeholder="Ex: Canapé, Table, Lit..."
                  />
                </label>

                <label className="furniture-field">
                  <span>Type de demande</span>
                  <select value={changeType} onChange={(event) => setChangeType(event.target.value)}>
                    {changeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="furniture-field">
                  <span>Motif</span>
                  <input
                    value={changeReason}
                    onChange={(event) => setChangeReason(event.target.value)}
                    placeholder="Ex: meuble endommagé, trop grand..."
                  />
                </label>

                <label className="furniture-field">
                  <span>Description</span>
                  <textarea
                    value={changeDescription}
                    onChange={(event) => setChangeDescription(event.target.value)}
                    placeholder="Plus de détails..."
                  />
                </label>

                <div className="furniture-upload-box" onClick={() => photoInputRef.current?.click()}>
                  <IonIcon icon={cameraOutline} />
                  <span>{changePhoto ? "Photo ajoutée, toucher pour remplacer" : "Ajouter une photo (optionnel)"}</span>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>

                {changePhoto ? <img className="furniture-upload-preview" src={changePhoto} alt="Aperçu de la photo" /> : null}

                <button type="button" className="furniture-primary-btn" disabled={changeBusy} onClick={handleSubmitChangeRequest}>
                  <IonIcon icon={mailOpenOutline} />
                  {changeBusy ? "Envoi..." : "Envoyer la demande"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isAddModalOpen ? (
          <div className="furniture-overlay" role="presentation" onClick={() => setIsAddModalOpen(false)}>
            <div className="furniture-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="furniture-modal-close" onClick={() => setIsAddModalOpen(false)}>
                <IonIcon icon={closeOutline} />
              </button>
              <div className="furniture-modal-body">
                <h3>Proposer un meuble</h3>
                <p>Votre suggestion sera validee par un administrateur avant d'apparaitre dans le catalogue.</p>

                <label className="furniture-field">
                  <span>Nom du meuble</span>
                  <input
                    value={newFurniture.name}
                    onChange={(event) => setNewFurniture(prev => ({ ...prev, name: event.target.value }))}
                    placeholder="Ex: Canape Scandinave"
                  />
                </label>

                <label className="furniture-field">
                  <span>Categorie</span>
                  <select 
                    value={newFurniture.category} 
                    onChange={(event) => setNewFurniture(prev => ({ ...prev, category: event.target.value }))}
                  >
                    {categories.filter(c => c !== 'Tous').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="furniture-field">
                  <span>Prix estime (DT)</span>
                  <input
                    type="number"
                    value={newFurniture.price}
                    onChange={(event) => setNewFurniture(prev => ({ ...prev, price: Number(event.target.value) }))}
                  />
                </label>

                <label className="furniture-field">
                  <span>Description</span>
                  <textarea
                    value={newFurniture.description}
                    onChange={(event) => setNewFurniture(prev => ({ ...prev, description: event.target.value }))}
                    placeholder="Details du meuble..."
                  />
                </label>

                <div className="furniture-upload-box" onClick={() => addPhotoInputRef.current?.click()}>
                  <IonIcon icon={cameraOutline} />
                  <span>{newFurniture.image ? "Photo ajoutee" : "Ajouter une photo"}</span>
                  <input ref={addPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhotoUpload} />
                </div>

                {newFurniture.image ? <img className="furniture-upload-preview" src={newFurniture.image} alt="Preview" /> : null}

                <button type="button" className="furniture-primary-btn" onClick={handleProposeFurniture}>
                  <IonIcon icon={addOutline} />
                  Envoyer la proposition
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </IonContent>
    </IonPage>
  )
}

export default FurniturePage
