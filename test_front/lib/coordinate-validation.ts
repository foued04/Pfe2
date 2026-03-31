/**
 * Coordinate Validation Utilities for Monastir, Tunisia
 * Bounds: Monastir region (approximately)
 */

// Monastir bounds (approximately)
export const MONASTIR_BOUNDS = {
  // Center: 35.7768, 10.8108
  north: 35.82,
  south: 35.70,
  east: 10.95,
  west: 10.55,
}

// Known neighborhoods with realistic coordinates
export const MONASTIR_NEIGHBORHOODS = {
  "centre-ville": { lat: 35.7768, lng: 10.8108, radius: 0.008 },
  "medina": { lat: 35.7756, lng: 10.8267, radius: 0.005 },
  "skanes": { lat: 35.7850, lng: 10.8320, radius: 0.01 },
  "marina": { lat: 35.7740, lng: 10.8380, radius: 0.008 },
  "khniss": { lat: 35.7620, lng: 10.8210, radius: 0.01 },
  "frina": { lat: 35.7710, lng: 10.8050, radius: 0.01 },
  "zone-aeroport": { lat: 35.7650, lng: 10.7820, radius: 0.015 },
  "port-el-kantaoui": { lat: 35.8250, lng: 10.8480, radius: 0.02 },
}

/**
 * Check if coordinates are within Monastir bounds
 */
export const isWithinMonastir = (lat: number, lng: number): boolean => {
  return (
    lat >= MONASTIR_BOUNDS.south &&
    lat <= MONASTIR_BOUNDS.north &&
    lng >= MONASTIR_BOUNDS.west &&
    lng <= MONASTIR_BOUNDS.east
  )
}

/**
 * Validate if coordinates are valid and realistic
 */
export const isValidCoordinate = (lat: number | undefined, lng: number | undefined): boolean => {
  // Check if coordinates exist and are numbers
  if (lat === undefined || lng === undefined) return false
  if (typeof lat !== "number" || typeof lng !== "number") return false
  if (isNaN(lat) || isNaN(lng)) return false

  // Basic lat/lng validation
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false

  // Check if within Monastir region
  return isWithinMonastir(lat, lng)
}

/**
 * Get fallback coordinates based on neighborhood
 */
export const getFallbackCoordinates = (neighborhood: string): { lat: number; lng: number } | null => {
  const key = neighborhood.toLowerCase().replace(/\s+/g, "-")
  const nb = MONASTIR_NEIGHBORHOODS[key as keyof typeof MONASTIR_NEIGHBORHOODS]
  
  if (!nb) return null
  
  return {
    lat: nb.lat + (Math.random() - 0.5) * nb.radius,
    lng: nb.lng + (Math.random() - 0.5) * nb.radius,
  }
}

/**
 * Get safe coordinates: validate or use fallback
 */
export const getSafeCoordinates = (
  lat: number | undefined,
  lng: number | undefined,
  neighborhood?: string
): { lat: number; lng: number; isValid: boolean } | null => {
  // If coordinates are valid, return them
  if (isValidCoordinate(lat, lng)) {
    return { lat: lat!, lng: lng!, isValid: true }
  }

  // Try to use fallback based on neighborhood
  if (neighborhood) {
    const fallback = getFallbackCoordinates(neighborhood)
    if (fallback) {
      return { ...fallback, isValid: false }
    }
  }

  // Default to Monastir center
  return {
    lat: (MONASTIR_BOUNDS.north + MONASTIR_BOUNDS.south) / 2,
    lng: (MONASTIR_BOUNDS.east + MONASTIR_BOUNDS.west) / 2,
    isValid: false,
  }
}

/**
 * Calculate distance between two coordinates (in kilometers)
 * Using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
