import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ImmoSmart",
  description: "Plateforme intelligente de gestion immobilière",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}