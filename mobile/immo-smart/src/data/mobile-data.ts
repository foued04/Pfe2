export type MobileProperty = {
  id: string
  title: string
  address: string
  city: string
  rent: number
  surface: number
  bedrooms: number
  bathrooms: number
  status: "available" | "rented" | "maintenance"
  type: "s0" | "s1" | "s2" | "s3" | "s4" | "villa"
  image: string
}

export const featuredProperties: MobileProperty[] = [
  {
    id: "1",
    title: "Villa moderne avec piscine",
    address: "Skanes, Monastir",
    city: "Monastir",
    rent: 2200,
    surface: 320,
    bedrooms: 4,
    bathrooms: 3,
    status: "available",
    type: "villa",
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Appartement S+2 lumineux",
    address: "Centre ville, Monastir",
    city: "Monastir",
    rent: 950,
    surface: 96,
    bedrooms: 2,
    bathrooms: 1,
    status: "available",
    type: "s2",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Studio meublé proche plage",
    address: "Khniss, Monastir",
    city: "Monastir",
    rent: 520,
    surface: 44,
    bedrooms: 1,
    bathrooms: 1,
    status: "rented",
    type: "s0",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop",
  },
]

export const ownerStats = [
  { label: "Biens", value: "12" },
  { label: "Demandes", value: "34" },
  { label: "Taux", value: "96%" },
]
