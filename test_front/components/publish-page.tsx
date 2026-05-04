"use client"

import { useEffect } from "react"
import { ArrowRight, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function PublishPage() {
  const router = useRouter()
  const { role } = useAuth()

  useEffect(() => {
    if (role === "owner") {
      router.replace("/dashboard/owner/properties/new")
    }
  }, [role, router])

  if (role === "owner") {
    return <div className="p-6 text-sm text-muted-foreground">Redirection vers le formulaire de publication...</div>
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)", padding: "24px" }}>
      <div style={{ maxWidth: "620px", background: "#fff", borderRadius: "28px", padding: "36px", textAlign: "center", boxShadow: "0 30px 60px rgba(148, 163, 184, 0.18)", border: "1px solid rgba(148, 163, 184, 0.18)" }}>
        <div style={{ width: "70px", height: "70px", margin: "0 auto", borderRadius: "20px", display: "grid", placeItems: "center", background: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}>
          <ShieldAlert size={30} />
        </div>
        <h1 style={{ margin: "18px 0 12px", fontSize: "34px", lineHeight: 1.1 }}>Publication reservee aux proprietaires</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
          La route de publication existe maintenant dans la navbar. Pour ajouter une annonce, il faut etre connecte avec un compte proprietaire.
        </p>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          style={{
            marginTop: "26px",
            border: "none",
            borderRadius: "14px",
            padding: "14px 18px",
            background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Retourner a mon profil
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
