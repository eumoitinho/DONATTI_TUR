import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { nanoid } from "nanoid"
import { z } from "zod"
import { redis, REDIS_KEYS } from "@/lib/redis"
import type { EmployeePerformance } from "@/types/user"
import type { User } from "@/types/user"

// Schema for performance review validation
const performanceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  period: z.string(),
  metrics: z.object({
    promosSent: z.number(),
    promosConverted: z.number(),
    totalValue: z.number(),
    customerSatisfaction: z.number().min(0).max(10),
    responseTime: z.number(),
  }),
  notes: z.string(),
  rating: z.number().min(0).max(10),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
})

// Redis key for performance reviews
const PERFORMANCE_KEY = "lemonde:employee_performance"

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only admins can view all performance reviews
    // Agents can only view their own
    const isAdmin = session.user.role === "admin"

    // Get query parameters
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const userId = url.searchParams.get("userId")

    // Get performance reviews from Redis
    const performanceData = (await redis.get<EmployeePerformance[]>(PERFORMANCE_KEY)) || []

    // If ID is provided, return specific review
    if (id) {
      const review = performanceData.find((p) => p.id === id)
      if (!review) {
        return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
      }

      // Check if user has permission to view this review
      if (!isAdmin && review.userId !== session.user.id) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
      }

      return NextResponse.json(review)
    }

    // Filter by user ID if provided
    let filteredData = performanceData
    if (userId) {
      // Check if user has permission to view these reviews
      if (!isAdmin && userId !== session.user.id) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
      }
      filteredData = performanceData.filter((p) => p.userId === userId)
    } else if (!isAdmin) {
      // If not admin and no userId specified, only return own reviews
      filteredData = performanceData.filter((p) => p.userId === session.user.id)
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("Error fetching performance reviews:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliações de desempenho" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only admins can create/update performance reviews
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()

    // Validate performance data
    const validationResult = performanceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validationResult.error.format() }, { status: 400 })
    }

    const performanceData = validationResult.data

    // Get current performance reviews from Redis
    const performanceReviews = (await redis.get<EmployeePerformance[]>(PERFORMANCE_KEY)) || []

    // Generate ID if not provided (new review)
    const isNewReview = !performanceData.id
    const reviewId = performanceData.id || nanoid()
    const now = new Date().toISOString()

    // Set timestamps and creator info
    const completeReviewData: EmployeePerformance & {
      id: string
      createdAt: string
      updatedAt: string
      createdBy: string
    } = {
      ...performanceData,
      id: reviewId,
      createdAt: isNewReview ? now : performanceData.createdAt || now,
      updatedAt: now,
      createdBy: isNewReview ? session.user.id : performanceData.createdBy || session.user.id,
    }

    // Save to Redis
    if (isNewReview) {
      performanceReviews.push(completeReviewData)
    } else {
      const index = performanceReviews.findIndex((p) => p.id === reviewId)
      if (index !== -1) {
        performanceReviews[index] = completeReviewData
      } else {
        performanceReviews.push(completeReviewData)
      }
    }

    // Update Redis
    await redis.set(PERFORMANCE_KEY, performanceReviews)

    // Update user's performance history
    const usersData = (await redis.get<User[]>(REDIS_KEYS.USERS)) || []
    const userIndex = usersData.findIndex((u) => u.id === performanceData.userId)

    if (userIndex !== -1) {
      if (!usersData[userIndex].performanceHistory) {
        usersData[userIndex].performanceHistory = []
      }

      usersData[userIndex].performanceHistory.push({
        date: now,
        type: "review",
        description: `Avaliação de desempenho - ${performanceData.period}`,
        value: performanceData.rating,
      })

      await redis.set(REDIS_KEYS.USERS, usersData)
    }

    return NextResponse.json(completeReviewData, { status: isNewReview ? 201 : 200 })
  } catch (error) {
    console.error("Error saving performance review:", error)
    return NextResponse.json({ error: "Erro ao salvar avaliação de desempenho" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only admins can delete performance reviews
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Get review ID from query
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID da avaliação não fornecido" }, { status: 400 })
    }

    // Get current performance reviews from Redis
    const performanceReviews = (await redis.get<EmployeePerformance[]>(PERFORMANCE_KEY)) || []

    // Check if review exists
    const index = performanceReviews.findIndex((p) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
    }

    // Delete review
    performanceReviews.splice(index, 1)

    // Update Redis
    await redis.set(PERFORMANCE_KEY, performanceReviews)

    return NextResponse.json({ success: true, message: "Avaliação excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting performance review:", error)
    return NextResponse.json({ error: "Erro ao excluir avaliação de desempenho" }, { status: 500 })
  }
}

