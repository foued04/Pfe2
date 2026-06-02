"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, CheckCircle2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import styles from "./request-access-page.module.css"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"EMAIL" | "RESET">("EMAIL")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(normalizedEmail)) {
      setError("Veuillez entrer une adresse email valide.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi du code.")
      }

      toast({
        title: "Code envoyé",
        description: data.message,
      })
      setStep("RESET")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!code.trim()) {
      setError("Le code de vérification est requis.")
      return
    }
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          code: code.trim(), 
          newPassword 
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la réinitialisation.")
      }

      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé.",
      })
      
      router.push("/login")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Card className={styles.card}>
          <CardContent className={styles.content}>
            <div className={styles.logoWrap}>
              <Image src="/logo.svg" alt="ImmoSmart Logo" width={160} height={160} className="object-contain" priority />
            </div>

            {step === "EMAIL" ? (
              <>
                <div className={styles.header}>
                  <h1>Mot de passe oublié ?</h1>
                  <p>Entrez votre email pour recevoir un code de réinitialisation.</p>
                </div>

                <form className={styles.form} onSubmit={handleRequestCode}>
                  <label className={styles.field}>
                    <span className={styles.label}>Email</span>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError("")
                      }}
                      placeholder="vous@email.com"
                      className={styles.input}
                      autoComplete="email"
                      aria-invalid={error ? "true" : "false"}
                    />
                  </label>

                  {error && <div className={`${styles.notice} ${styles.error}`}>{error}</div>}

                  <Button type="submit" size="lg" className={styles.submit} disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Recevoir le code"}
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <div className={styles.footer}>
                    <Link href="/login" className={styles.link}>
                      Retour à la connexion
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className={styles.header}>
                  <h1>Nouveau mot de passe</h1>
                  <p>Entrez le code reçu par email et votre nouveau mot de passe.</p>
                </div>

                <form className={styles.form} onSubmit={handleResetPassword}>
                  <label className={styles.field}>
                    <span className={styles.label}>Code de vérification</span>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        if (error) setError("")
                      }}
                      placeholder="123456"
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Nouveau mot de passe</span>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        if (error) setError("")
                      }}
                      placeholder="Min 6 caractères"
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Confirmer le mot de passe</span>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (error) setError("")
                      }}
                      placeholder="Confirmez votre mot de passe"
                      className={styles.input}
                    />
                  </label>

                  {error && <div className={`${styles.notice} ${styles.error}`}>{error}</div>}

                  <Button type="submit" size="lg" className={styles.submit} disabled={isSubmitting}>
                    {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    {!isSubmitting && <CheckCircle2 className="h-4 w-4" />}
                  </Button>

                  <div className={styles.footer}>
                    <button type="button" onClick={() => setStep("EMAIL")} className={styles.link}>
                      Je n'ai pas reçu de code
                    </button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
