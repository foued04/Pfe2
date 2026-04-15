export type FurnitureCategory = "Salon" | "Chambre" | "Salle à manger" | "Cuisine" | "Décoration" | "Bureau"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchFurniture() {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/furniture`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch furniture");
  const data = await response.json();
  // Map backend _id to id for frontend compatibility
  return data.map((item: any) => ({
    ...item,
    id: item._id
  }));
}

export async function addFurnitureItem(itemData: Partial<FurnitureItem>) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/furniture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) throw new Error("Failed to add furniture");
  return response.json();
}

export async function updateFurnitureItem(id: string, itemData: Partial<FurnitureItem>) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/furniture/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) throw new Error("Failed to update furniture");
  return response.json();
}

export async function deleteFurnitureItem(id: string) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/furniture/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete furniture");
  return response.json();
}

export async function submitFurnitureOrder(orderData: any) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/furniture/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error("Failed to submit order");
  return response.json();
}

export async function updateFurnitureStatus(id: string, status: string) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/furniture/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update status");
  return response.json();
}

// Keep the catalog for fallback or initial state if needed, but we'll mostly use the API now.
export const furnitureCatalog: FurnitureItem[] = []; 
