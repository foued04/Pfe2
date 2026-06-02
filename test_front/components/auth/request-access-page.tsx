"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useGoogleLogin } from "@react-oauth/google"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import styles from "./request-access-page.module.css"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sendVerificationCode = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 900))

  return {
    success: true,
    message: `Un code de connexion a ete prepare pour ${email}.`,
  }
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function RequestAccessPage() {
  const { isAuthenticated, isLoading, loginWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const propertyTitle = searchParams.get("propertyTitle")
  const redirectTarget = searchParams.get("redirect") || "/dashboard"

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    router.replace(redirectTarget)
  }, [isAuthenticated, isLoading, redirectTarget, router])

  const helperText = useMemo(() => {
    if (!propertyTitle) return null
    return `Vous etes en train de demander l'acces pour ${propertyTitle}.`
  }, [propertyTitle])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError("Veuillez entrer une adresse email valide.")
      setStatusMessage("")
      return
    }

    setIsSubmitting(true)
    setEmailError("")
    setStatusMessage("")

    try {
      const result = await sendVerificationCode(normalizedEmail)
      setStatusMessage(result.message)
      toast({
        title: "Code envoye",
        description: result.message,
      })
    } catch (error) {
      console.error("Send verification code error:", error)
      const message = "Impossible d'envoyer le code pour le moment."
      setEmailError(message)
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true)
      setEmailError("")
      try {
        const result = await loginWithGoogle(tokenResponse.access_token, "login")
        if (!result.success) {
          const message = result.message || "Echec de la connexion Google."
          setEmailError(message)
          toast({
            title: "Connexion impossible",
            description: message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Google login error:", error)
        const message = "Erreur lors de la connexion Google."
        setEmailError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    onError: () => {
      const message = "Erreur lors de la connexion Google."
      setEmailError(message)
      toast({
        title: "Connexion Google",
        description: message,
        variant: "destructive",
      })
    },
  })

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Card className={styles.card}>
          <CardContent className={styles.content}>
            <div className={styles.logoWrap}>
              <Image src="/logo.svg" alt="ImmoSmart Logo" width={160} height={160} className="object-contain" priority />
            </div>

            <div className={styles.header}>
              <h1>Heureux de vous revoir !</h1>
              <p>Entrez votre email et nous vous enverrons un code de connexion.</p>
              {helperText ? <p className="mt-3 text-sm font-medium text-primary">{helperText}</p> : null}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (emailError) setEmailError("")
                  }}
                  placeholder="vous@email.com"
                  className={styles.input}
                  autoComplete="email"
                  aria-invalid={emailError ? "true" : "false"}
                />
              </label>

              {emailError ? <div className={`${styles.notice} ${styles.error}`}>{emailError}</div> : null}
              {statusMessage ? <div className={`${styles.notice} ${styles.success}`}>{statusMessage}</div> : null}

              <Button type="submit" size="lg" className={styles.submit} disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Continuer"}
                {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>

              <div className={styles.divider}>Ou</div>

              <Button
                type="button"
                size="lg"
                variant="outline"
                className={styles.googleButton}
                onClick={() => googleLogin()}
                disabled={isSubmitting}
              >
                <GoogleMark />
                Continuer avec Google
              </Button>

              <div className={styles.footer}>
                Pas de compte ?{" "}
                <Link href="/register" className={styles.link}>
                  Creer un compte
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
