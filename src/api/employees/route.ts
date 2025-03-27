import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"
import { nanoid } from "nanoid"
import { z } from "zod"
import { redis, REDIS_KEYS } from "@/lib/redis"
import type { User } from "@/types/user"

// Schema for employee validation
const employeeSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
  role: z.enum(["admin", "agent"], {
    errorMap: () => ({ message: "Função deve ser admin ou agent" }),
  }),
  active: z.boolean().optional(),
  salary: z.number().optional(),
  admissionDate: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  birthDate: z.string().optional(),
  documentId: z.string().optional(),
  bankInfo: z
    .object({
      bank: z.string().optional(),
      accountType: z.string().optional(),
      accountNumber: z.string().optional(),
      agency: z.string().optional(),
    })
    .optional(),
  performanceHistory: z
    .array(
      z.object({
        date: z.string(),
        type: z.enum(["review", "promotion", "warning", "bonus"]),
        description: z.string(),
        value: z.number().optional(),
      }),
    )
    .optional(),
})

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only admins can list employees
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    // Get users from Redis
    const usersData = (await redis.get<User[]>(REDIS_KEYS.USERS)) || []

    // If ID is provided, return specific user
    if (id) {
      const user = usersData.find((u) => u.id === id)
      if (!user) {
        return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user
      return NextResponse.json(userWithoutPassword)
    }

    // Return all users without passwords
    const usersWithoutPasswords = usersData.map(({ password, ...user }) => user)
    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Erro ao buscar funcionários" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only admins can create/update employees
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()

    // Validate employee data
    const validationResult = employeeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validationResult.error.format() }, { status: 400 })
    }

    const employeeData = validationResult.data

    // Get current users from Redis
    const usersData = (await redis.get<User[]>(REDIS_KEYS.USERS)) || []

    // Check if email already exists
    const emailExists = usersData.some(
      (u) => u.email === employeeData.email && (!employeeData.id || u.id !== employeeData.id),
    )
    if (emailExists) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Generate ID if not provided (new employee)
    const isNewEmployee = !employeeData.id
    const employeeId = employeeData.id || nanoid()
    const now = new Date().toISOString()

    // Set timestamps
    const completeEmployeeData: User = {
      id: employeeId,
      email: employeeData.email,
      name: employeeData.name,
      password:
        employeeData.password ||
        (isNewEmployee ? "changeme123" : usersData.find((u) => u.id === employeeId)?.password || "changeme123"),
      role: employeeData.role,
      createdAt: isNewEmployee ? now : employeeData.createdAt || now,
      updatedAt: now,
      active: isNewEmployee ? true : (employeeData.active ?? true),
      salary: employeeData.salary,
      admissionDate: employeeData.admissionDate || now,
      department: employeeData.department,
      position: employeeData.position,
      phoneNumber: employeeData.phoneNumber,
      address: employeeData.address,
      emergencyContact: employeeData.emergencyContact,
      birthDate: employeeData.birthDate,
      documentId: employeeData.documentId,
      bankInfo: employeeData.bankInfo,
      performanceHistory: employeeData.performanceHistory || [],
    }

    // Save to Redis
    if (isNewEmployee) {
      usersData.push(completeEmployeeData)
    } else {
      const index = usersData.findIndex((u) => u.id === employeeId)
      if (index !== -1) {
        // Preserve password if not provided
        if (!employeeData.password) {
          completeEmployeeData.password = usersData[index].password
        }
        usersData[index] = completeEmployeeData
      } else {
        usersData.push(completeEmployeeData)
      }
    }

    // Update Redis
    await redis.set(REDIS_KEYS.USERS, usersData)

    // Don't return password
    const { password, ...employeeWithoutPassword } = completeEmployeeData
    return NextResponse.json(employeeWithoutPassword, { status: isNewEmployee ? 201 : 200 })
  } catch (error) {
    console.error("Error saving employee:", error)
    return NextResponse.json({ error: "Erro ao salvar funcionário" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only admins can delete employees
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Get employee ID from query
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do funcionário não fornecido" }, { status: 400 })
    }

    // Get current users from Redis
    const usersData = (await redis.get<User[]>(REDIS_KEYS.USERS)) || []

    // Check if employee exists
    const index = usersData.findIndex((u) => u.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    // Don't allow deleting the last admin
    if (usersData[index].role === "admin") {
      const adminCount = usersData.filter((u) => u.role === "admin" && u.active).length
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Não é possível excluir o último administrador" }, { status: 400 })
      }
    }

    // Instead of deleting, mark as inactive
    usersData[index].active = false
    usersData[index].updatedAt = new Date().toISOString()

    // Update Redis
    await redis.set(REDIS_KEYS.USERS, usersData)

    return NextResponse.json({ success: true, message: "Funcionário desativado com sucesso" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Erro ao excluir funcionário" }, { status: 500 })
  }
}

