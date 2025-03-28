import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/options"
import PromosDashboard from "@/components/promos/PromosDashboard"

export const metadata: Metadata = {
  title: "Gerenciador de Promoções | Donatti Turismo",
  description: "Gerencie as promoções de viagens e pacotes turísticos da Donatti Turismo.",
}

export default async function PromosPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/promos/login")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PromosDashboard user={session.user} />
    </main>
  )
}

