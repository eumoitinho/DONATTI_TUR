"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Home, FileText } from "lucide-react"
import Logo from "../../../public/assets/logo-preto.png"
import LogoIcon from "../../../public/assets/logo-icon-preto.png"
import { signOut } from "next-auth/react"

interface UserProps {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
}

interface AgentHeaderProps {
  user: UserProps
  onSignOut: () => void
}

export function AgentHeader({ user }: AgentHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="bg-white shadow-sm py-3 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/agente" className="flex items-center">
          <div className="hidden sm:block">
            <Image src={Logo || "/placeholder.svg"} alt="Donatti Turismo" priority className="h-12 w-auto" />
          </div>
          <div className="sm:hidden">
            <Image src={LogoIcon || "/placeholder.svg"} alt="Donatti Turismo" className="h-10 w-auto" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/agente"
            className="text-gray-600 hover:text-primary-blue transition-colors font-mon flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            Promoções
          </Link>

          <Link href="/" className="text-gray-600 hover:text-primary-blue transition-colors font-mon flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Site Principal
          </Link>

          <div className="flex items-center">
            <div className="bg-second-blue text-white p-2 rounded-full mr-3">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 font-mon">{user.name || "Agente"}</p>
              <p className="text-xs text-gray-500 font-mon">{user.email}</p>
            </div>
          </div>

          <button
                    onClick={handleSignOut}>
                  </button>
                </div>
              </div>
            </header>
  )}
