import { resolveApiUrl } from "@/lib/api/client"

export type FurnitureCategory = "Salon" | "Chambre" | "Salle Ã  manger" | "Cuisine" | "DÃ©coration" | "Bureau"

export interface FurnitureItem {
  id: string
  name: string
  category: FurnitureCategory
  price: number
  image: string
  description?: string
}

export interface CartItem extends FurnitureItem {
  quantity: number
}

export type OrderStatus = "Brouillon" | "VÃ©rifiÃ©e" | "ConfirmÃ©e" | "ReÃ§ue"

export interface FurnitureOrder {
  id: string
  propertyId: string
  propertyName: string
  date: string
  items: CartItem[]
  total: number
  paymentMethod: string
  status: OrderStatus
}

const normalizeCategory = (category: string): FurnitureCategory => {
  if (category === "Salle ÃƒÂ  manger") return "Salle Ã  manger"
  if (category === "DÃƒÂ©coration") return "DÃ©coration"
  return category as FurnitureCategory
}

export const furnitureCatalog: FurnitureItem[] = [
  {
    id: "catalog-canape-lina",
    name: "CanapÃ© d'angle Lina",
    category: "Salon",
    price: 1890,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    description: "CanapÃ© d'angle en tissu beige, assise profonde et structure robuste pour un salon locatif confortable.",
  },
  {
    id: "catalog-table-basse-noyer",
    name: "Table basse Noyer",
    category: "Salon",
    price: 420,
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?auto=format&fit=crop&w=900&q=85",
    description: "Table basse en bois naturel avec lignes simples, parfaite pour un sÃ©jour moderne et facile Ã  entretenir.",
  },
  {
    id: "catalog-lit-hotelier",
    name: "Lit hÃ´telier 160 cm",
    category: "Chambre",
    price: 1450,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
    description: "Lit double avec tÃªte rembourrÃ©e, matelas ferme et finition Ã©lÃ©gante pour une chambre prÃªte Ã  louer.",
  },
  {
    id: "catalog-armoire-oslo",
    name: "Armoire Oslo 3 portes",
    category: "Chambre",
    price: 980,
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85",
    description: "Armoire spacieuse avec penderie et Ã©tagÃ¨res, pensÃ©e pour optimiser le rangement dans une chambre.",
  },
  {
    id: "catalog-table-gourmet",
    name: "Table Ã  manger Gourmet",
    category: "Salle Ã  manger",
    price: 1250,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
    description: "Grande table familiale en chÃªne massif huilÃ©, idÃ©ale pour les repas quotidiens et les rÃ©ceptions.",
  },
  {
    id: "catalog-chaises-roma",
    name: "Lot de 4 chaises Roma",
    category: "Salle Ã  manger",
    price: 760,
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=85",
    description: "Chaises rembourrÃ©es avec pieds mÃ©tal noir, confortables et rÃ©sistantes pour une salle Ã  manger meublÃ©e.",
  },
  {
    id: "catalog-cuisine-premium",
    name: "Cuisine Premium intÃ©grÃ©e",
    category: "Cuisine",
    price: 5200,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=85",
    description: "Cuisine Ã©quipÃ©e avec rangements, plan de travail et finitions modernes pour valoriser le logement.",
  },
  {
    id: "catalog-pack-electromenager",
    name: "Pack Ã©lectromÃ©nager Chef",
    category: "Cuisine",
    price: 3800,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85",
    description: "RÃ©frigÃ©rateur, four, plaque et hotte coordonnÃ©s pour une cuisine fonctionnelle et prÃªte Ã  l'usage.",
  },
  {
    id: "catalog-tapis-berbere",
    name: "Tapis berbÃ¨re doux",
    category: "DÃ©coration",
    price: 420,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85",
    description: "Tapis texturÃ© aux tons neutres pour rÃ©chauffer un salon, une chambre ou un coin lecture.",
  },
  {
    id: "catalog-lampadaire-arc",
    name: "Lampadaire Arc noir",
    category: "DÃ©coration",
    price: 310,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85",
    description: "Ã‰clairage d'ambiance avec silhouette fine, idÃ©al pour crÃ©er une atmosphÃ¨re professionnelle.",
  },
  {
    id: "catalog-bureau-nomad",
    name: "Bureau Nomad compact",
    category: "Bureau",
    price: 690,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=85",
    description: "Bureau compact avec plateau bois et rangements, adaptÃ© au tÃ©lÃ©travail dans un appartement meublÃ©.",
  },
  {
    id: "catalog-chaise-ergonomique",
    name: "Chaise ergonomique Pro",
    category: "Bureau",
    price: 540,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=85",
    description: "Chaise de bureau rÃ©glable avec soutien lombaire, pensÃ©e pour un usage quotidien confortable.",
  },
]

export function getFurnitureFallbackImage(item: Partial<FurnitureItem>) {
  const category = item.category ? normalizeCategory(String(item.category)) : undefined
  return (
    furnitureCatalog.find((catalogItem) => catalogItem.name === item.name)?.image ||
    furnitureCatalog.find((catalogItem) => catalogItem.category === category)?.image ||
    furnitureCatalog[0]?.image ||
    ""
  )
}

export async function fetchFurniture() {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(`${resolveApiUrl()}/furniture`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("Failed to fetch furniture")
  const data = await response.json()
  const backendItems = (Array.isArray(data) ? data : []).map((item: any) => ({
    ...item,
    id: item._id || item.id,
    category: normalizeCategory(item.category),
    image: item.image || getFurnitureFallbackImage(item),
  }))
  const backendNames = new Set(backendItems.map((item: FurnitureItem) => item.name.toLowerCase()))
  const curatedItems = furnitureCatalog.filter((item) => !backendNames.has(item.name.toLowerCase()))
  return [...backendItems, ...curatedItems]
}

export async function addFurnitureItem(itemData: Partial<FurnitureItem>) {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(`${resolveApiUrl()}/furniture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  })
  if (!response.ok) throw new Error("Failed to add furniture")
  return response.json()
}

export async function updateFurnitureItem(id: string, itemData: Partial<FurnitureItem>) {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(`${resolveApiUrl()}/furniture/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  })
  if (!response.ok) throw new Error("Failed to update furniture")
  return response.json()
}

export async function deleteFurnitureItem(id: string) {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(`${resolveApiUrl()}/furniture/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("Failed to delete furniture")
  return response.json()
}

export async function submitFurnitureOrder(orderData: any) {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(`${resolveApiUrl()}/furniture/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  if (!response.ok) throw new Error("Failed to submit order")
  return response.json()
}

export async function updateFurnitureStatus(id: string, status: string) {
  const token = localStorage.getItem("accessToken")
  const response = await fetch(`${resolveApiUrl()}/furniture/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error("Failed to update status")
  return response.json()
}
