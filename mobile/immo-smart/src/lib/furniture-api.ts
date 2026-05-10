import { http } from "./api"
import type {
  BackendFurniture,
  BackendFurnitureChangeRequest,
  BackendFurnitureOrder,
} from "../types/api"

export type MobileFurnitureItem = BackendFurniture & {
  id: string
}

const curatedFurnitureCatalog: MobileFurnitureItem[] = [
  {
    _id: "catalog-canape-lina",
    id: "catalog-canape-lina",
    name: "Canape d'angle Lina",
    category: "Salon",
    price: 1890,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    description: "Canape d'angle en tissu beige, assise profonde et structure robuste pour un salon locatif confortable.",
  },
  {
    _id: "catalog-table-basse-noyer",
    id: "catalog-table-basse-noyer",
    name: "Table basse Noyer",
    category: "Salon",
    price: 420,
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?auto=format&fit=crop&w=900&q=85",
    description: "Table basse en bois naturel avec lignes simples, parfaite pour un sejour moderne et facile a entretenir.",
  },
  {
    _id: "catalog-lit-hotelier",
    id: "catalog-lit-hotelier",
    name: "Lit hotelier 160 cm",
    category: "Chambre",
    price: 1450,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
    description: "Lit double avec tete rembourree, matelas ferme et finition elegante pour une chambre prete a louer.",
  },
  {
    _id: "catalog-armoire-oslo",
    id: "catalog-armoire-oslo",
    name: "Armoire Oslo 3 portes",
    category: "Chambre",
    price: 980,
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85",
    description: "Armoire spacieuse avec penderie et etageres, pensee pour optimiser le rangement dans une chambre.",
  },
  {
    _id: "catalog-table-gourmet",
    id: "catalog-table-gourmet",
    name: "Table a manger Gourmet",
    category: "Salle a manger",
    price: 1250,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
    description: "Grande table familiale en chene massif huile, ideale pour les repas quotidiens et les receptions.",
  },
  {
    _id: "catalog-chaises-roma",
    id: "catalog-chaises-roma",
    name: "Lot de 4 chaises Roma",
    category: "Salle a manger",
    price: 760,
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=85",
    description: "Chaises rembourrees avec pieds metal noir, confortables et resistantes pour une salle a manger meublee.",
  },
  {
    _id: "catalog-cuisine-premium",
    id: "catalog-cuisine-premium",
    name: "Cuisine Premium integree",
    category: "Cuisine",
    price: 5200,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=85",
    description: "Cuisine equipee avec rangements, plan de travail et finitions modernes pour valoriser le logement.",
  },
  {
    _id: "catalog-pack-electromenager",
    id: "catalog-pack-electromenager",
    name: "Pack electromenager Chef",
    category: "Cuisine",
    price: 3800,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85",
    description: "Refrigerateur, four, plaque et hotte coordonnes pour une cuisine fonctionnelle et prete a l'usage.",
  },
  {
    _id: "catalog-tapis-berbere",
    id: "catalog-tapis-berbere",
    name: "Tapis berbere doux",
    category: "Decoration",
    price: 420,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85",
    description: "Tapis texture aux tons neutres pour rechauffer un salon, une chambre ou un coin lecture.",
  },
  {
    _id: "catalog-lampadaire-arc",
    id: "catalog-lampadaire-arc",
    name: "Lampadaire Arc noir",
    category: "Decoration",
    price: 310,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85",
    description: "Eclairage d'ambiance avec silhouette fine, ideal pour creer une atmosphere professionnelle.",
  },
  {
    _id: "catalog-bureau-nomad",
    id: "catalog-bureau-nomad",
    name: "Bureau Nomad compact",
    category: "Bureau",
    price: 690,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=85",
    description: "Bureau compact avec plateau bois et rangements, adapte au teletravail dans un appartement meuble.",
  },
  {
    _id: "catalog-chaise-ergonomique",
    id: "catalog-chaise-ergonomique",
    name: "Chaise ergonomique Pro",
    category: "Bureau",
    price: 540,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=85",
    description: "Chaise de bureau reglable avec soutien lombaire, pensee pour un usage quotidien confortable.",
  },
]

export const getFurnitureFallbackImage = (item: Partial<MobileFurnitureItem>) => {
  const byName = curatedFurnitureCatalog.find((catalogItem) => catalogItem.name === item.name)
  if (byName?.image) return byName.image

  const byCategory = curatedFurnitureCatalog.find((catalogItem) => catalogItem.category === item.category)
  return byCategory?.image || curatedFurnitureCatalog[0]?.image || ""
}

export const fetchFurniture = async (token?: string) => {
  const data = await http.get<BackendFurniture[]>("/furniture", token)
  const backendItems = (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    id: item._id || item.name,
    image: item.image || getFurnitureFallbackImage(item),
  }))
  const backendNames = new Set(backendItems.map((item) => item.name.toLowerCase()))
  const curatedItems = curatedFurnitureCatalog.filter((item) => !backendNames.has(item.name.toLowerCase()))
  return [...backendItems, ...curatedItems] as MobileFurnitureItem[]
}

export const fetchFurnitureByProperty = (propertyId: string, token: string) => {
  return http.get<Array<BackendFurniture & { id?: string; quantity?: number }>>(`/furniture/property/${propertyId}`, token)
}

export const fetchTenantFurnitureOrders = (token: string) => {
  return http.get<BackendFurnitureOrder[]>("/furniture/tenant-orders", token)
}

export const saveFurnitureOrder = (
  payload: {
    contractId?: string
    propertyId?: string
    items: Array<{ furniture?: string; name?: string; category?: string; quantity: number; price: number }>
    total: number
    paymentMethod?: string
  },
  token: string,
) => {
  return http.post<BackendFurnitureOrder>("/furniture/order", payload, token)
}

export const createFurnitureChangeRequest = (
  payload: {
    furnitureId?: string
    furnitureName?: string
    contractId?: string
    propertyId?: string
    type: string
    reason: string
    description?: string
    photo?: string
  },
  token: string,
) => {
  return http.post<BackendFurnitureChangeRequest>("/furniture/change-requests", payload, token)
}

export const addFurnitureItem = (payload: any, token: string) => {
  return http.post<BackendFurniture>("/furniture", payload, token)
}
