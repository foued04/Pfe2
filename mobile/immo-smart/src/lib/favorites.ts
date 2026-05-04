const favoritesKey = (userId: string) => `tenantFavorites:${userId}`
export const FAVORITES_UPDATED_EVENT = "tenant-favorites-updated"

const readFavorites = (userId: string) => {
  if (!userId) return []

  try {
    const raw = localStorage.getItem(favoritesKey(userId))
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

const writeFavorites = (userId: string, propertyIds: string[]) => {
  if (!userId) return
  localStorage.setItem(favoritesKey(userId), JSON.stringify(propertyIds))
  window.dispatchEvent(
    new CustomEvent(FAVORITES_UPDATED_EVENT, {
      detail: { userId, propertyIds },
    })
  )
}

export const getFavoritePropertyIds = (userId: string) => readFavorites(userId)

export const isFavoriteProperty = (userId: string, propertyId: string) =>
  readFavorites(userId).includes(propertyId)

export const toggleFavoriteProperty = (userId: string, propertyId: string) => {
  const favorites = readFavorites(userId)
  const nextFavorites = favorites.includes(propertyId)
    ? favorites.filter((id) => id !== propertyId)
    : [...favorites, propertyId]

  writeFavorites(userId, nextFavorites)
  return nextFavorites
}
