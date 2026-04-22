import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"
import { AuthProvider } from "@/lib/auth-context"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { Toaster } from "@/components/ui/toaster"
import { ChatbotTrigger } from "@/components/ai-chatbot"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ImmoSmart",
  description: "Plateforme intelligente de gestion immobilière",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
              <I18nProvider>
                {children}
                <Toaster />
                <ChatbotTrigger />
              </I18nProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
