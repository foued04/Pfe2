import { useEffect, useRef, useState } from "react"

interface ImageCaptchaProps {
  onVerify: (isValid: boolean) => void
}

type Category =
  | "Maisons"
  | "Voitures"
  | "Immeubles"
  | "Escaliers"
  | "Piscines"
  | "Salons"
  | "Jardins"
  | "Chats"
  | "Chiens"
  | "Fleurs"

interface CaptchaImage {
  id: number
  url: string
  category: Category
}

const IMAGES: CaptchaImage[] = [
  { id: 1, category: "Maisons", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 2, category: "Maisons", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 3, category: "Maisons", url: "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 16, category: "Maisons", url: "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 17, category: "Maisons", url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 4, category: "Voitures", url: "https://images.unsplash.com/photo-1745421977200-77ced89731c3?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 5, category: "Voitures", url: "https://images.unsplash.com/photo-1770364276116-92b507f179ac?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 6, category: "Voitures", url: "https://images.unsplash.com/photo-1696176559269-c944fb2ec40f?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 18, category: "Voitures", url: "https://images.unsplash.com/photo-1770390296072-d8ab545535a5?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 19, category: "Voitures", url: "https://images.unsplash.com/photo-1765785900629-3ba71564c9af?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 7, category: "Immeubles", url: "https://images.unsplash.com/photo-1618439569122-eddffc5104b8?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 8, category: "Immeubles", url: "https://images.unsplash.com/photo-1634547487344-c3aa2e1aacdf?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 9, category: "Immeubles", url: "https://images.unsplash.com/photo-1691052478686-53dd49bb4480?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 20, category: "Immeubles", url: "https://images.unsplash.com/photo-1548512340-a674c5575a13?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 21, category: "Immeubles", url: "https://images.unsplash.com/photo-1716827172045-c320e9066a50?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 10, category: "Escaliers", url: "https://images.unsplash.com/photo-1649001241420-cbd5641d4951?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 11, category: "Escaliers", url: "https://images.unsplash.com/photo-1704040686324-e0552fbc9167?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 12, category: "Escaliers", url: "https://images.unsplash.com/photo-1690201028885-edaa38df93bd?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 15, category: "Escaliers", url: "https://images.unsplash.com/photo-1764793184370-0a8345119aa0?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 22, category: "Escaliers", url: "https://images.unsplash.com/photo-1710493559740-e04b9e89ef92?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 23, category: "Piscines", url: "https://images.unsplash.com/photo-1527534079274-21dc9147f3d0?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 24, category: "Piscines", url: "https://images.unsplash.com/photo-1770387208660-ffc01897fd59?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 25, category: "Piscines", url: "https://images.unsplash.com/photo-1763479142885-47f05d01cad1?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 26, category: "Piscines", url: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 27, category: "Piscines", url: "https://images.unsplash.com/photo-1695592690356-1266107c9471?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 28, category: "Salons", url: "https://images.unsplash.com/photo-1720247520881-672bc136da8a?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 29, category: "Salons", url: "https://images.unsplash.com/photo-1592401526914-7e5d94a8d6fa?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 30, category: "Salons", url: "https://images.unsplash.com/photo-1720247520862-7e4b14176fa8?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 31, category: "Salons", url: "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 32, category: "Salons", url: "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 33, category: "Jardins", url: "https://images.unsplash.com/photo-1680034733365-ad7263988417?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 34, category: "Jardins", url: "https://images.unsplash.com/photo-1771558969707-45e93dfd2570?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 35, category: "Jardins", url: "https://images.unsplash.com/photo-1704457030496-3463cf1b8650?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 36, category: "Jardins", url: "https://images.unsplash.com/photo-1762811054947-605b20298615?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 37, category: "Jardins", url: "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 38, category: "Chats", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 39, category: "Chats", url: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 40, category: "Chats", url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 41, category: "Chats", url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 42, category: "Chats", url: "https://images.unsplash.com/photo-1529778458726-365c73224b17?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 43, category: "Chiens", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 44, category: "Chiens", url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 45, category: "Chiens", url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 46, category: "Chiens", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 47, category: "Chiens", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 48, category: "Fleurs", url: "https://images.unsplash.com/photo-1490750967868-88cb4ecb0701?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 49, category: "Fleurs", url: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 50, category: "Fleurs", url: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 51, category: "Fleurs", url: "https://images.unsplash.com/photo-1460500063983-994d4c27756c?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 52, category: "Fleurs", url: "https://images.unsplash.com/photo-1508610048659-a06b669e3319?auto=format&fit=crop&w=300&h=300&q=80" },
]

const CATEGORIES: Category[] = ["Maisons", "Voitures", "Immeubles", "Escaliers", "Piscines", "Salons", "Jardins", "Chats", "Chiens", "Fleurs"]

const FALLBACK_IMAGE_BY_CATEGORY: Record<Category, string> = {
  Maisons: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&h=300&q=80",
  Voitures: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=300&h=300&q=80",
  Immeubles: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&h=300&q=80",
  Escaliers: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=300&h=300&q=80",
  Piscines: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=300&h=300&q=80",
  Salons: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&h=300&q=80",
  Jardins: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&h=300&q=80",
  Chats: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=300&h=300&q=80",
  Chiens: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&h=300&q=80",
  Fleurs: "https://images.unsplash.com/photo-1490750967868-88cb4ecb0701?auto=format&fit=crop&w=300&h=300&q=80",
}

const PLACEHOLDER_EMOJI_BY_CATEGORY: Record<Category, string> = {
  Maisons: "🏠",
  Voitures: "🚗",
  Immeubles: "🏢",
  Escaliers: "🪜",
  Piscines: "🏊",
  Salons: "🛋️",
  Jardins: "🌳",
  Chats: "🐱",
  Chiens: "🐶",
  Fleurs: "🌸",
}

const createPlaceholderDataUrl = (category: Category) => {
  const emoji = PLACEHOLDER_EMOJI_BY_CATEGORY[category]
  const label = category
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dbeafe" />
          <stop offset="100%" stop-color="#bfdbfe" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" rx="24" fill="url(#bg)" />
      <text x="150" y="120" text-anchor="middle" font-size="68">${emoji}</text>
      <text x="150" y="185" text-anchor="middle" font-size="26" font-family="Arial, sans-serif" font-weight="700" fill="#1e3a8a">${label}</text>
      <text x="150" y="220" text-anchor="middle" font-size="14" font-family="Arial, sans-serif" fill="#475569">Image indisponible</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function ImageCaptcha({ onVerify }: ImageCaptchaProps) {
  const [targetCategory, setTargetCategory] = useState<Category>("Maisons")
  const [gridImages, setGridImages] = useState<CaptchaImage[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [brokenImageIds, setBrokenImageIds] = useState<number[]>([])
  const autoRefreshTimeoutRef = useRef<number | null>(null)
  const autoRefreshScheduledRef = useRef(false)

  const generateNewChallenge = () => {
    if (autoRefreshTimeoutRef.current) {
      window.clearTimeout(autoRefreshTimeoutRef.current)
      autoRefreshTimeoutRef.current = null
    }
    autoRefreshScheduledRef.current = false

    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    const availableImages = IMAGES.filter((img) => !brokenImageIds.includes(img.id))
    const sourceImages = availableImages.length >= 9 ? availableImages : IMAGES
    const targetSet = sourceImages.filter((img) => img.category === randomCategory).sort(() => 0.5 - Math.random())
    const otherSet = sourceImages.filter((img) => img.category !== randomCategory).sort(() => 0.5 - Math.random())
    const targetCount = Math.floor(Math.random() * 2) + 3
    const finalGrid = [...targetSet.slice(0, targetCount), ...otherSet.slice(0, 9 - targetCount)].sort(() => 0.5 - Math.random())

    setTargetCategory(randomCategory)
    setGridImages(finalGrid)
    setSelectedIds([])
    setIsError(false)
    setIsSuccess(false)
  }

  useEffect(() => {
    generateNewChallenge()
  }, [])

  useEffect(() => {
    return () => {
      if (autoRefreshTimeoutRef.current) {
        window.clearTimeout(autoRefreshTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (brokenImageIds.length === 0) return
    setGridImages((current) =>
      current.map((img) =>
        brokenImageIds.includes(img.id)
          ? { ...img, url: createPlaceholderDataUrl(img.category) }
          : img,
      ),
    )
  }, [brokenImageIds])

  const toggleSelection = (id: number) => {
    if (isSuccess) return
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    setIsError(false)
  }

  const handleVerify = () => {
    const correctIds = gridImages.filter((img) => img.category === targetCategory).map((img) => img.id)
    const isSolved = selectedIds.length > 0 && selectedIds.every((id) => correctIds.includes(id))

    if (isSolved) {
      setIsSuccess(true)
      onVerify(true)
      return
    }

    setIsError(true)
    window.setTimeout(() => generateNewChallenge(), 800)
  }

  const handleImageError = (image: CaptchaImage) => {
    setBrokenImageIds((current) => (current.includes(image.id) ? current : [...current, image.id]))
    if (!autoRefreshScheduledRef.current) {
      autoRefreshScheduledRef.current = true
      autoRefreshTimeoutRef.current = window.setTimeout(() => {
        generateNewChallenge()
      }, 700)
    }
  }

  return (
    <div className="captcha-card">
      <div className="captcha-head">
        <p>Verification humaine</p>
        <h4>Selectionnez toutes les images "{targetCategory}"</h4>
      </div>

      <div className="captcha-grid">
        {gridImages.map((img) => {
          const isSelected = selectedIds.includes(img.id)
          return (
            <button
              key={img.id}
              type="button"
              className={`captcha-tile ${isSelected ? "selected" : ""} ${isError ? "error" : ""}`}
              onClick={() => toggleSelection(img.id)}
            >
              <img src={img.url} alt={img.category} loading="lazy" onError={() => handleImageError(img)} />
              {isSelected ? <span className="captcha-check">✓</span> : null}
            </button>
          )
        })}
      </div>

      <div className="captcha-actions">
        <button type="button" className="captcha-secondary" onClick={generateNewChallenge}>
          Recharger
        </button>
        <button type="button" className="captcha-primary" disabled={selectedIds.length === 0 || isSuccess} onClick={handleVerify}>
          {isSuccess ? "Verifie" : "Verifier"}
        </button>
      </div>
    </div>
  )
}
