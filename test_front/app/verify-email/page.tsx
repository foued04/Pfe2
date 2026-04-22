"use client"

import { useEffect, useMemo, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Home, Loader2, MailCheck } from "lucide-react"
import Link from "next/link"

function VerificationInput({
  length = 6,
  onChange,
  onComplete,
}: {
  length?: number
  onChange: (value: string) => void
  onComplete?: (value: string) => void
}) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const updateCode = (nextCode: string[]) => {
    setCode(nextCode)
    const combined = nextCode.join("")
    onChange(combined)

    if (nextCode.every((digit) => digit !== "") && onComplete) {
      onComplete(combined)
    }
  }

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    if (!digit && value !== "") return

    const nextCode = [...code]
    nextCode[index] = digit
    updateCode(nextCode)

    if (digit && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, length)
    if (!pasted) return

    const nextCode = Array(length).fill("")
    pasted.split("").forEach((char, index) => {
      nextCode[index] = char
    })

    updateCode(nextCode)
    focusInput(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="flex justify-center gap-3 sm:gap-4" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[index]}
          onChange={(event) => handleChange(event.target.value, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className="h-14 w-11 rounded-2xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:h-16 sm:w-12 sm:text-2xl"
        />
      ))}
    </div>
  )
}

function VerificationContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  const getDashboardPath = (role?: string) => {
    if (role === "owner") return "/dashboard/owner"
    if (role === "tenant") return "/dashboard/tenant"
    if (role === "admin") return "/dashboard/admin"
    return "/dashboard"
  }

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = window.setTimeout(() => setResendTimer((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendTimer])

  const maskedEmail = useMemo(() => email || "votre adresse email", [email])

  const handleVerify = async (targetEmail: string, targetCode: string) => {
    if (!targetEmail || targetCode.length < 6) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, code: targetCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Code invalide ou expiré.")
        return
      }

      setSuccess(true)

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        window.setTimeout(() => {
          window.location.href = getDashboardPath(data.user?.role)
        }, 1800)
      }
    } catch {
      setError("Erreur de connexion au serveur.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email || resendTimer > 0) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        setError("Erreur lors du renvoi du code.")
        return
      }

      setResendTimer(60)
    } catch {
      setError("Erreur de connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_45%,_#f8fafc_100%)] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.02fr_0.98fr]">
          <section className="relative hidden bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_58%,#60a5fa_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(191,219,254,0.18),_transparent_34%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/12 backdrop-blur">
                <Home className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-100">
                  Vérification sécurisée
                </p>
                <h1 className="max-w-md text-4xl font-bold leading-tight">
                  Confirmez votre adresse email pour activer votre espace.
                </h1>
                <p className="max-w-md text-base leading-7 text-blue-50/90">
                  Saisissez le code reçu par email pour finaliser votre connexion et accéder à votre tableau de bord ImmoSmart.
                </p>
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <MailCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-100">Adresse vérifiée</p>
                  <p className="text-lg font-semibold text-white">{maskedEmail}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md space-y-8">
              <div className="space-y-5 text-center lg:text-left">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[28px] bg-blue-50 text-blue-600 shadow-inner lg:mx-0">
                  <Home className="h-9 w-9" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.15rem]">
                    Vérification du compte
                  </h2>
                  <p className="text-base leading-7 text-slate-600">
                    {success
                      ? "Votre compte est activé. Redirection en cours vers votre espace."
                      : `Entrez le code à 6 chiffres envoyé à ${maskedEmail}.`}
                  </p>
                </div>
              </div>

              {!success ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="votre@email.tn"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Code de vérification
                      </p>
                    </div>

                    <VerificationInput
                      length={6}
                      onChange={setCode}
                      onComplete={(value) => handleVerify(email, value)}
                    />

                    <p className="text-center text-sm leading-6 text-slate-500">
                      Vous pouvez copier et coller le code reçu par email.
                    </p>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    onClick={() => handleVerify(email, code)}
                    disabled={isLoading || code.length < 6}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#3b82f6_55%,#60a5fa_100%)] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isLoading ? "Vérification..." : "Vérifier le compte"}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0 || !email || isLoading}
                    className="w-full text-center text-sm font-medium text-blue-700 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {resendTimer > 0
                      ? `Renvoyer le code dans ${resendTimer}s`
                      : "Je n'ai pas reçu le code"}
                  </button>
                </div>
              ) : (
                <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <p className="text-xl font-semibold text-emerald-700">Compte activé</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-700/80">
                    Votre vérification a bien été prise en compte.
                  </p>
                </div>
              )}

              <div className="border-t border-slate-200 pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Chargement...</div>}>
      <VerificationContent />
    </Suspense>
  )
}
