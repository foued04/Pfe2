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

export type OrderStatus = "Brouillon" | "Vérifiée" | "Confirmée" | "Reçue"

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
  if (!category) return "Salon"
  if (category.includes("manger")) return "Salle à manger"
  if (category.includes("coration") || category.includes("ration")) return "Décoration"
  return category as FurnitureCategory
}

export const furnitureCatalog: FurnitureItem[] = [
  {
    id: "catalog-canape-lina",
    name: "Canapé d'angle Lina",
    category: "Salon",
    price: 1890,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    description: "Canapé d'angle en tissu beige, assise profonde et structure robuste pour un salon locatif confortable.",
  },
  {
    id: "catalog-table-basse-noyer",
    name: "Table basse Noyer",
    category: "Salon",
    price: 420,
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?auto=format&fit=crop&w=900&q=85",
    description: "Table basse en bois naturel avec lignes simples, parfaite pour un séjour moderne et facile à entretenir.",
  },
  {
    id: "catalog-lit-hotelier",
    name: "Lit hôtelier 160 cm",
    category: "Chambre",
    price: 1450,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
    description: "Lit double avec tête rembourrée, matelas ferme et finition élégante pour une chambre prête à louer.",
  },
  {
    id: "catalog-armoire-oslo",
    name: "Armoire Oslo 3 portes",
    category: "Chambre",
    price: 980,
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85",
    description: "Armoire spacieuse avec penderie et étagères, pensée pour optimiser le rangement dans une chambre.",
  },
  {
    id: "catalog-table-gourmet",
    name: "Table à manger Gourmet",
    category: "Salle à manger",
    price: 1250,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
    description: "Grande table familiale en chêne massif huilé, idéale pour les repas quotidiens et les réceptions.",
  },
  {
    id: "catalog-chaises-roma",
    name: "Lot de 4 chaises Roma",
    category: "Salle à manger",
    price: 760,
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=85",
    description: "Chaises rembourrées avec pieds métal noir, confortables et résistantes pour une salle à manger meublée.",
  },
  {
    id: "catalog-cuisine-premium",
    name: "Cuisine Premium intégrée",
    category: "Cuisine",
    price: 5200,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=85",
    description: "Cuisine équipée avec rangements, plan de travail et finitions modernes pour valoriser le logement.",
  },
  {
    id: "catalog-pack-electromenager",
    name: "Pack électroménager Chef",
    category: "Cuisine",
    price: 3800,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85",
    description: "Réfrigérateur, four, plaque et hotte coordonnés pour une cuisine fonctionnelle et prête à l'usage.",
  },
  {
    id: "catalog-tapis-berbere",
    name: "Tapis berbère doux",
    category: "Décoration",
    price: 420,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85",
    description: "Tapis texturé aux tons neutres pour réchauffer un salon, une chambre ou un coin lecture.",
  },
  {
    id: "catalog-lampadaire-arc",
    name: "Lampadaire Arc noir",
    category: "Décoration",
    price: 310,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85",
    description: "Éclairage d'ambiance avec silhouette fine, idéal pour créer une atmosphère professionnelle.",
  },
  {
    id: "catalog-bureau-nomad",
    name: "Bureau Nomad compact",
    category: "Bureau",
    price: 690,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=85",
    description: "Bureau compact avec plateau bois et rangements, adapté au télétravail dans un appartement meublé.",
  },
  {
    id: "catalog-chaise-ergonomique",
    name: "Chaise ergonomique Pro",
    category: "Bureau",
    price: 540,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=85",
    description: "Chaise de bureau réglable avec soutien lombaire, pensée pour un usage quotidien confortable.",
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
