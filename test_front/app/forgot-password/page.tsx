import { ForgotPasswordPage } from "@/components/auth/forgot-password-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mot de passe oublié | ImmoSmart",
  description: "Réinitialisez votre mot de passe",
}

export default function ForgotPassword() {
  return <ForgotPasswordPage />
}
