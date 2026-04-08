"use client"

import { useState, useEffect } from "react"
import { Check, RotateCw, ShieldCheck } from "lucide-react"

interface ImageCaptchaProps {
  onVerify: (isValid: boolean) => void
}

type Category = "Maisons" | "Voitures" | "Immeubles" | "Escaliers" | "Piscines" | "Salons" | "Jardins" | "Chats" | "Chiens" | "Fleurs"

interface CaptchaImage {
  id: number
  url: string
  category: Category
}

const IMAGES: CaptchaImage[] = [
  // Maisons
  { id: 1, category: "Maisons", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 2, category: "Maisons", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 3, category: "Maisons", url: "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 16, category: "Maisons", url: "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 17, category: "Maisons", url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=300&h=300&q=80" },
  // Voitures
  { id: 4, category: "Voitures", url: "https://images.unsplash.com/photo-1745421977200-77ced89731c3?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 5, category: "Voitures", url: "https://images.unsplash.com/photo-1770364276116-92b507f179ac?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 6, category: "Voitures", url: "https://images.unsplash.com/photo-1696176559269-c944fb2ec40f?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 18, category: "Voitures", url: "https://images.unsplash.com/photo-1770390296072-d8ab545535a5?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 19, category: "Voitures", url: "https://images.unsplash.com/photo-1765785900629-3ba71564c9af?auto=format&fit=crop&w=300&h=300&q=80" },
  // Immeubles
  { id: 7, category: "Immeubles", url: "https://images.unsplash.com/photo-1618439569122-eddffc5104b8?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 8, category: "Immeubles", url: "https://images.unsplash.com/photo-1634547487344-c3aa2e1aacdf?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 9, category: "Immeubles", url: "https://images.unsplash.com/photo-1691052478686-53dd49bb4480?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 20, category: "Immeubles", url: "https://images.unsplash.com/photo-1548512340-a674c5575a13?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 21, category: "Immeubles", url: "https://images.unsplash.com/photo-1716827172045-c320e9066a50?auto=format&fit=crop&w=300&h=300&q=80" },
  // Escaliers
  { id: 10, category: "Escaliers", url: "https://images.unsplash.com/photo-1649001241420-cbd5641d4951?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 11, category: "Escaliers", url: "https://images.unsplash.com/photo-1704040686324-e0552fbc9167?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 12, category: "Escaliers", url: "https://images.unsplash.com/photo-1690201028885-edaa38df93bd?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 15, category: "Escaliers", url: "https://images.unsplash.com/photo-1764793184370-0a8345119aa0?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 22, category: "Escaliers", url: "https://images.unsplash.com/photo-1710493559740-e04b9e89ef92?auto=format&fit=crop&w=300&h=300&q=80" },
  // Piscines
  { id: 23, category: "Piscines", url: "https://images.unsplash.com/photo-1527534079274-21dc9147f3d0?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 24, category: "Piscines", url: "https://images.unsplash.com/photo-1770387208660-ffc01897fd59?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 25, category: "Piscines", url: "https://images.unsplash.com/photo-1763479142885-47f05d01cad1?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 26, category: "Piscines", url: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 27, category: "Piscines", url: "https://images.unsplash.com/photo-1695592690356-1266107c9471?auto=format&fit=crop&w=300&h=300&q=80" },
  // Salons
  { id: 28, category: "Salons", url: "https://images.unsplash.com/photo-1720247520881-672bc136da8a?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 29, category: "Salons", url: "https://images.unsplash.com/photo-1592401526914-7e5d94a8d6fa?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 30, category: "Salons", url: "https://images.unsplash.com/photo-1720247520862-7e4b14176fa8?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 31, category: "Salons", url: "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 32, category: "Salons", url: "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=300&h=300&q=80" },
  // Jardins
  { id: 33, category: "Jardins", url: "https://images.unsplash.com/photo-1680034733365-ad7263988417?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 34, category: "Jardins", url: "https://images.unsplash.com/photo-1771558969707-45e93dfd2570?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 35, category: "Jardins", url: "https://images.unsplash.com/photo-1704457030496-3463cf1b8650?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 36, category: "Jardins", url: "https://images.unsplash.com/photo-1762811054947-605b20298615?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 37, category: "Jardins", url: "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?auto=format&fit=crop&w=300&h=300&q=80" },
  // Chats
  { id: 38, category: "Chats", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 39, category: "Chats", url: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 40, category: "Chats", url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 41, category: "Chats", url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 42, category: "Chats", url: "https://images.unsplash.com/photo-1529778458726-365c73224b17?auto=format&fit=crop&w=300&h=300&q=80" },
  // Chiens
  { id: 43, category: "Chiens", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 44, category: "Chiens", url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 45, category: "Chiens", url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 46, category: "Chiens", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 47, category: "Chiens", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&h=300&q=80" },
  // Fleurs
  { id: 48, category: "Fleurs", url: "https://images.unsplash.com/photo-1490750967868-88cb4ecb0701?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 49, category: "Fleurs", url: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 50, category: "Fleurs", url: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 51, category: "Fleurs", url: "https://images.unsplash.com/photo-1460500063983-994d4c27756c?auto=format&fit=crop&w=300&h=300&q=80" },
  { id: 52, category: "Fleurs", url: "https://images.unsplash.com/photo-1508610048659-a06b669e3319?auto=format&fit=crop&w=300&h=300&q=80" },
]

export function ImageCaptcha({ onVerify }: ImageCaptchaProps) {
  const [targetCategory, setTargetCategory] = useState<Category>("Maisons")
  const [gridImages, setGridImages] = useState<CaptchaImage[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loadedImages, setLoadedImages] = useState<number[]>([])

  const categories: Category[] = ["Maisons", "Voitures", "Immeubles", "Escaliers", "Piscines", "Salons", "Jardins", "Chats", "Chiens", "Fleurs"]

  const generateNewChallenge = () => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    setTargetCategory(randomCategory)
    setLoadedImages([])
    
    // Shuffle all images and pick 9
    const targetSet = IMAGES.filter(img => img.category === randomCategory)
    const otherSet = IMAGES.filter(img => img.category !== randomCategory)
    
    const shuffledTargets = [...targetSet].sort(() => 0.5 - Math.random())
    const shuffledOthers = [...otherSet].sort(() => 0.5 - Math.random())
    
    // Pick 3-4 targets
    const targetCount = Math.floor(Math.random() * 2) + 3 // 3 or 4
    const selectedTargets = shuffledTargets.slice(0, targetCount)
    const selectedOthers = shuffledOthers.slice(0, 9 - targetCount)
    
    const final9 = [...selectedTargets, ...selectedOthers].sort(() => 0.5 - Math.random())
    
    setGridImages(final9)
    setSelectedIds([])
    setIsError(false)
    setIsSuccess(false)
  }

  useEffect(() => {
    generateNewChallenge()
  }, [])

  const toggleSelection = (id: number) => {
    if (isSuccess) return
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
    setIsError(false)
  }

  const handleImageError = (failedId: number) => {
    setGridImages(prev => {
      const newGrid = prev.map(img => {
        if (img.id === failedId) {
          // Find a replacement from the same category to keep the logic valid
          const replacements = IMAGES.filter(i => 
            i.category === img.category && 
            !prev.some(p => p.id === i.id)
          )
          if (replacements.length > 0) {
            return replacements[Math.floor(Math.random() * replacements.length)]
          }
        }
        return img
      })
      return newGrid
    })
  }

  const handleVerify = () => {
    const correctIds = gridImages
      .filter(img => img.category === targetCategory)
      .map(img => img.id)
    
    const isSolved = 
      selectedIds.length > 0 && 
      selectedIds.every(id => correctIds.includes(id))

    if (isSolved) {
      setIsSuccess(true)
      onVerify(true)
    } else {
      setIsError(true)
      // Visual feedback before generating a new challenge
      setTimeout(generateNewChallenge, 800)
    }
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "380px",
      margin: "0 auto",
      userSelect: "none"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #158C96 0%, #2EC4C7 100%)",
        padding: "24px 20px",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "100px",
          height: "100px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          filter: "blur(20px)"
        }} />
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, opacity: 0.9, letterSpacing: "0.5px" }}>
          VÉRIFICATION HUMAINE
        </p>
        <h3 style={{ margin: "8px 0 0", fontSize: "26px", fontWeight: 900, textTransform: "lowercase", letterSpacing: "-1px" }}>
          {targetCategory}
        </h3>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "4px",
        padding: "4px",
        background: "#fff"
      }}>
        {gridImages.map((img, index) => {
          const isSelected = selectedIds.includes(img.id)
          // Add a unique key based on position and image id to force re-render correctly
          const uniqueKey = `${img.id}-${index}-${gridImages.length}`
          
          return (
            <div 
              key={uniqueKey}
              onClick={() => toggleSelection(img.id)}
              style={{
                position: "relative",
                aspectRatio: "1",
                cursor: isSuccess ? "default" : "pointer",
                overflow: "hidden",
                transition: "transform 0.25s cubic-bezier(0.165, 0.84, 0.44, 1)",
                borderRadius: "8px",
                background: "#f3f4f6"
              }}
            >
              <img 
                src={img.url} 
                alt="captcha" 
                onLoad={() => setLoadedImages(prev => Array.from(new Set([...prev, img.id])))}
                onError={() => handleImageError(img.id)}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  transition: "opacity 0.5s ease-in-out, transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  transform: isSelected ? "scale(0.85)" : "scale(1)",
                  borderRadius: isSelected ? "12px" : "0",
                  opacity: loadedImages.includes(img.id) ? 1 : 0,
                  filter: isError ? "grayscale(1) contrast(0.5) blur(1px)" : "none"
                }} 
              />
              {!loadedImages.includes(img.id) && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                  backgroundSize: "200% 100%",
                  animation: "skeleton-shimmer 1.5s infinite"
                }}>
                  <style>{`
                    @keyframes skeleton-shimmer {
                      0% { background-position: 200% 0; }
                      100% { background-position: -200% 0; }
                    }
                  `}</style>
                </div>
              )}
              {isSelected && (
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  background: "#2EC4C7",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  zIndex: 2
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
              {isSelected && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(46,196,199,0.15)",
                  zIndex: 1,
                  pointerEvents: "none"
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid #f3f4f6"
      }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <button 
            type="button"
            onClick={generateNewChallenge}
            disabled={isSuccess}
            style={{ 
              background: "none", border: "none", cursor: "pointer", 
              color: "#9ca3af", padding: "8px", borderRadius: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { if(!isSuccess) e.currentTarget.style.background = "#f3f4f6" }}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <RotateCw size={20} />
          </button>
        </div>

        <button 
          type="button"
          onClick={handleVerify}
          disabled={isSuccess || selectedIds.length === 0}
          style={{
            background: isSuccess ? "#10b981" : (isError ? "#ef4444" : "#2EC4C7"),
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.3s",
            opacity: selectedIds.length === 0 ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {isSuccess ? (
            <>
              <ShieldCheck size={18} />
              Vérifié
            </>
          ) : (isError ? "Réessayer..." : "VÉRIFIER")}
        </button>
      </div>
    </div>
  )
}
