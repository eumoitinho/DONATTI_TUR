import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { initializeRedis } from "@/lib/redis"

// Define Edge runtime
// export const runtime = "edge"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Initialize Redis
    await initializeRedis()

    return NextResponse.json({ success: true, message: "Redis initialized successfully" })
  } catch (error) {
    console.error("Error initializing Redis:", error)
    return NextResponse.json({ error: "Erro ao inicializar Redis" }, { status: 500 })
  }
}

