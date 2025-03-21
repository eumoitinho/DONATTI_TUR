"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Instagram, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Message {
  id: string
  platform: "instagram" | "whatsapp"
  sender: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  timestamp: string
  read: boolean
  replied: boolean
}

interface Conversation {
  id: string
  platform: "instagram" | "whatsapp"
  contact: {
    id: string
    name: string
    avatar?: string
    phone?: string
    username?: string
  }
  lastMessage: {
    content: string
    timestamp: string
    isFromContact: boolean
  }
  unreadCount: number
}

export function SocialMediaDashboard() {
  const [activeTab, setActiveTab] = useState("whatsapp")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations(activeTab as "instagram" | "whatsapp")
  }, [activeTab])

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async (platform: "instagram" | "whatsapp") => {
    setIsLoading(true)
    try {
      // This would be a real API call in production
      // const response = await fetch(`/api/social/${platform}/conversations`)
      // const data = await response.json()

      // Mock data for demonstration
      const mockData: Conversation[] = [
        {
          id: "conv1",
          platform,
          contact: {
            id: "user1",
            name: "Maria Silva",
            avatar: "",
            phone: "+5511987654321",
            username: "mariasilva",
          },
          lastMessage: {
            content: "Olá, gostaria de saber mais sobre o pacote para Cancún",
            timestamp: new Date().toISOString(),
            isFromContact: true,
          },
          unreadCount: 2,
        },
        {
          id: "conv2",
          platform,
          contact: {
            id: "user2",
            name: "João Pereira",
            avatar: "",
            phone: "+5511912345678",
            username: "joaopereira",
          },
          lastMessage: {
            content: "Obrigado pelas informações!",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isFromContact: true,
          },
          unreadCount: 0,
        },
        {
          id: "conv3",
          platform,
          contact: {
            id: "user3",
            name: "Ana Beatriz",
            avatar: "",
            phone: "+5511998765432",
            username: "anabeatriz",
          },
          lastMessage: {
            content: "Vou verificar as datas e te retorno",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            isFromContact: false,
          },
          unreadCount: 0,
        },
      ]

      setConversations(mockData)
    } catch (error) {
      console.error(`Error fetching ${platform} conversations:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    setIsLoading(true)
    try {
      // This would be a real API call in production
      // const response = await fetch(`/api/social/${activeTab}/conversations/${conversationId}/messages`)
      // const data = await response.json()

      // Mock data for demonstration
      const conversation = conversations.find((c) => c.id === conversationId)
      if (!conversation) return

      const mockMessages: Message[] = [
        {
          id: "msg1",
          platform: activeTab as "instagram" | "whatsapp",
          sender: {
            id: conversation.contact.id,
            name: conversation.contact.name,
            avatar: conversation.contact.avatar,
          },
          content: "Olá, gostaria de saber mais sobre o pacote para Cancún que vi no Instagram.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          replied: true,
        },
        {
          id: "msg2",
          platform: activeTab as "instagram" | "whatsapp",
          sender: {
            id: "agent",
            name: "Agente",
            avatar: "",
          },
          content:
            "Olá! Claro, temos pacotes para Cancún com saídas em várias datas. Qual seria o período que você está pensando em viajar?",
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          read: true,
          replied: false,
        },
        {
          id: "msg3",
          platform: activeTab as "instagram" | "whatsapp",
          sender: {
            id: conversation.contact.id,
            name: conversation.contact.name,
            avatar: conversation.contact.avatar,
          },
          content: "Estou pensando em ir na segunda quinzena de julho, seria para mim e minha esposa.",
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          read: true,
          replied: true,
        },
        {
          id: "msg4",
          platform: activeTab as "instagram" | "whatsapp",
          sender: {
            id: "agent",
            name: "Agente",
            avatar: "",
          },
          content:
            "Perfeito! Temos um pacote de 7 noites no Resort All-Inclusive Paradisus Cancún com voo direto. O valor para julho está em R$ 9.850 por pessoa. Posso te enviar mais detalhes?",
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          read: true,
          replied: false,
        },
        {
          id: "msg5",
          platform: activeTab as "instagram" | "whatsapp",
          sender: {
            id: conversation.contact.id,
            name: conversation.contact.name,
            avatar: conversation.contact.avatar,
          },
          content: "Sim, por favor! Gostaria de saber o que está incluso e as formas de pagamento.",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: false,
          replied: false,
        },
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error(`Error fetching messages:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      // This would be a real API call in production
      // await fetch(`/api/social/${activeTab}/conversations/${selectedConversation}/messages`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newMessage })
      // })

      // Optimistically update UI
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        platform: activeTab as "instagram" | "whatsapp",
        sender: {
          id: "agent",
          name: "Agente",
          avatar: "",
        },
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: true,
        replied: false,
      }

      setMessages((prev) => [...prev, newMsg])

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
                ...conv,
                lastMessage: {
                  content: newMessage,
                  timestamp: new Date().toISOString(),
                  isFromContact: false,
                },
              }
            : conv,
        ),
      )

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm", { locale: ptBR })
  }

  const formatConversationTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "HH:mm", { locale: ptBR })
    }

    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      return format(date, "EEE", { locale: ptBR })
    }

    // Otherwise show date
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="w-full justify-start bg-transparent p-0">
            <TabsTrigger
              value="whatsapp"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none px-6 py-3"
            >
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger
              value="instagram"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-3"
            >
              <Instagram className="h-5 w-5 mr-2 text-purple-600" />
              <span>Instagram</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-300px)] min-h-[500px]">
          {/* Conversations List */}
          <div className="border-r overflow-y-auto">
            <div className="p-3 border-b">
              <Input
                placeholder={`Pesquisar ${activeTab === "whatsapp" ? "contatos" : "mensagens"}...`}
                className="w-full"
              />
            </div>

            {isLoading && conversations.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${selectedConversation === conversation.id ? "bg-gray-100" : ""}`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.contact.avatar} />
                        <AvatarFallback className="bg-primary-blue text-white">
                          {conversation.contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium truncate">{conversation.contact.name}</p>
                          <span className="text-xs text-gray-500">
                            {formatConversationTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage.isFromContact ? "" : "Você: "}
                            {conversation.lastMessage.content}
                          </p>

                          {conversation.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className={activeTab === "whatsapp" ? "bg-green-500" : "bg-purple-500"}
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b flex items-center space-x-3">
                  {conversations.find((c) => c.id === selectedConversation) && (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversations.find((c) => c.id === selectedConversation)?.contact.avatar} />
                        <AvatarFallback className="bg-primary-blue text-white">
                          {conversations
                            .find((c) => c.id === selectedConversation)
                            ?.contact.name.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium">
                          {conversations.find((c) => c.id === selectedConversation)?.contact.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activeTab === "whatsapp"
                            ? conversations.find((c) => c.id === selectedConversation)?.contact.phone
                            : `@${conversations.find((c) => c.id === selectedConversation)?.contact.username}`}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === "agent" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender.id === "agent"
                              ? activeTab === "whatsapp"
                                ? "bg-green-100"
                                : "bg-purple-100"
                              : "bg-white border"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-gray-500 text-right mt-1">
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message input */}
                <div className="p-3 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="flex-1 resize-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={
                        activeTab === "whatsapp"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50">
                <div className={`rounded-full p-4 ${activeTab === "whatsapp" ? "bg-green-100" : "bg-purple-100"} mb-4`}>
                  {activeTab === "whatsapp" ? (
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  ) : (
                    <Instagram className="h-8 w-8 text-purple-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {activeTab === "whatsapp" ? "WhatsApp Business" : "Instagram Direct"}
                </h3>
                <p className="text-gray-500 max-w-md">
                  Selecione uma conversa para visualizar e responder às mensagens dos seus clientes.
                </p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

