import type React from "react"
import type { Metadata } from "next"
import { PromoProvider } from "@/providers/PromoProvider"
import { AuthProvider } from "@/providers/AuthProvider"

export const metadata: Metadata = {
  title: "Área do Agente | Donatti Turismo",
  description: "Sistema de gerenciamento de promoções da Donatti Turismo",
}

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <PromoProvider>{children}</PromoProvider>
    </AuthProvider>
  )
}

