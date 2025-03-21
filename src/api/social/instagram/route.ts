import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/options"
import { nanoid } from "nanoid"
import { redis } from "@/lib/redis"

// Redis key for Instagram messages
const INSTAGRAM_MESSAGES_KEY = "lemonde:instagram_messages"

// Message interface
interface InstagramMessage {
  id: string
  sender: {
    id: string
    username: string
    profilePicture?: string
  }
  content: string
  timestamp: string
  read: boolean
  replied: boolean
  assignedTo?: string
  replies?: {
    id: string
    content: string
    timestamp: string
    sentBy: string
    sentByName: string
  }[]
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const unreadOnly = url.searchParams.get("unread") === "true"
    const assignedToMe = url.searchParams.get("assignedToMe") === "true"

    // Get messages from Redis
    const messages = (await redis.get<InstagramMessage[]>(INSTAGRAM_MESSAGES_KEY)) || []

    // If ID is provided, return specific message
    if (id) {
      const message = messages.find((m) => m.id === id)
      if (!message) {
        return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 })
      }
      return NextResponse.json(message)
    }

    // Apply filters
    let filteredMessages = messages

    if (unreadOnly) {
      filteredMessages = filteredMessages.filter((m) => !m.read)
    }

    if (assignedToMe) {
      filteredMessages = filteredMessages.filter((m) => m.assignedTo === session.user.id)
    }

    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(filteredMessages)
  } catch (error) {
    console.error("Error fetching Instagram messages:", error)
    return NextResponse.json({ error: "Erro ao buscar mensagens do Instagram" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()

    // Check if this is a reply to an existing message
    if (body.messageId && body.reply) {
      // Get messages from Redis
      const messages = (await redis.get<InstagramMessage[]>(INSTAGRAM_MESSAGES_KEY)) || []

      // Find the message to reply to
      const messageIndex = messages.findIndex((m) => m.id === body.messageId)
      if (messageIndex === -1) {
        return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 })
      }

      // Add the reply
      const reply = {
        id: nanoid(),
        content: body.reply,
        timestamp: new Date().toISOString(),
        sentBy: session.user.id,
        sentByName: session.user.name || "Usuário",
      }

      if (!messages[messageIndex].replies) {
        messages[messageIndex].replies = []
      }

      messages[messageIndex].replies.push(reply)
      messages[messageIndex].replied = true

      // Update Redis
      await redis.set(INSTAGRAM_MESSAGES_KEY, messages)

      return NextResponse.json(reply, { status: 201 })
    }

    // For demo purposes, allow creating a mock message
    if (body.mockMessage && session.user.role === "admin") {
      const newMessage: InstagramMessage = {
        id: nanoid(),
        sender: {
          id: nanoid(),
          username: body.mockMessage.username || "instagram_user",
          profilePicture: body.mockMessage.profilePicture,
        },
        content: body.mockMessage.content || "Olá, gostaria de informações sobre pacotes para Cancún.",
        timestamp: new Date().toISOString(),
        read: false,
        replied: false,
      }

      // Get messages from Redis
      const messages = (await redis.get<InstagramMessage[]>(INSTAGRAM_MESSAGES_KEY)) || []

      // Add new message
      messages.push(newMessage)

      // Update Redis
      await redis.set(INSTAGRAM_MESSAGES_KEY, messages)

      return NextResponse.json(newMessage, { status: 201 })
    }

    // Handle message assignment
    if (body.messageId && body.assignTo) {
      // Get messages from Redis
      const messages = (await redis.get<InstagramMessage[]>(INSTAGRAM_MESSAGES_KEY)) || []

      // Find the message to assign
      const messageIndex = messages.findIndex((m) => m.id === body.messageId)
      if (messageIndex === -1) {
        return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 })
      }

      // Assign the message
      messages[messageIndex].assignedTo = body.assignTo

      // Update Redis
      await redis.set(INSTAGRAM_MESSAGES_KEY, messages)

      return NextResponse.json(messages[messageIndex])
    }

    // Handle marking as read
    if (body.messageId && body.markAsRead) {
      // Get messages from Redis
      const messages = (await redis.get<InstagramMessage[]>(INSTAGRAM_MESSAGES_KEY)) || []

      // Find the message to mark as read
      const messageIndex = messages.findIndex((m) => m.id === body.messageId)
      if (messageIndex === -1) {
        return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 })
      }

      // Mark as read
      messages[messageIndex].read = true

      // Update Redis
      await redis.set(INSTAGRAM_MESSAGES_KEY, messages)

      return NextResponse.json(messages[messageIndex])
    }

    return NextResponse.json({ error: "Operação não suportada" }, { status: 400 })
  } catch (error) {
    console.error("Error handling Instagram message:", error)
    return NextResponse.json({ error: "Erro ao processar mensagem do Instagram" }, { status: 500 })
  }
}

