import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ficha Técnica de Receitas",
  description: "Sistema de gerenciamento de fichas técnicas de receitas com geração de PDF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DashboardLayout>{children}</DashboardLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
