import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ReduxProvider } from "@/providers/redux-provider"
import { AuthProvider } from "@/features/auth/providers/auth-provider"
import { AuthHydration } from "@/features/auth/components/AuthHydration"

export const metadata: Metadata = {
  title: "Markandle - Social Media Automation",
  description: "AI-powered social media automation platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} min-h-screen bg-background`}>
        <ReduxProvider>
          <AuthHydration />
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  )
}
