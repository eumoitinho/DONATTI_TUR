"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, MessageSquare, Send, RefreshCw, Loader2, UserCheck, CheckCircle, Clock, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Image from "next/image"

interface Message {
  id: string
  sender: {
    id: string
    username?: string
    name?: string
    phoneNumber?: string
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

export function SocialMediaDashboard() {
  const [activeTab, setActiveTab] = useState("instagram")
  const [instagramMessages, setInstagramMessages] = useState<Message[]>([])
  const [whatsappMessages, setWhatsappMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUnread, setFilterUnread] = useState(false)
  const [filterAssigned, setFilterAssigned] = useState(false)

  useEffect(() => {
    fetchInstagramMessages()
    fetchWhatsappMessages()
  }, [])

  const fetchInstagramMessages = async () => {
    setIsLoading(true)
    try {
      let url = "/api/social/instagram"
      if (filterUnread) url += "?unread=true"
      if (filterAssigned) url += `${filterUnread ? "&" : "?"}assignedToMe=true`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch Instagram messages")
      const data = await response.json()
      setInstagramMessages(data)
    } catch (err) {
      console.error("Error fetching Instagram messages:", err)
      setError("Erro ao buscar mensagens do Instagram")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWhatsappMessages = async () => {
    setIsLoading(true)
    try {
      let url = "/api/social/whatsapp"
      if (filterUnread) url += "?unread=true"
      if (filterAssigned) url += `${filterUnread ? "&" : "?"}assignedToMe=true`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch WhatsApp messages")
      const data = await response.json()
      setWhatsappMessages(data)
    } catch (err) {
      console.error("Error fetching WhatsApp messages:", err)
      setError("Erro ao buscar mensagens do WhatsApp")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setIsLoading(true)
    try {
      const endpoint = activeTab === "instagram" ? "/api/social/instagram" : "/api/social/whatsapp"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          reply: replyText,
        }),
      })

      if (!response.ok) throw new Error(`Failed to send ${activeTab} reply`)

      // Update the message in the UI
      if (activeTab === "instagram") {
        setInstagramMessages((prev) =>
          prev.map((msg) =>
            msg.id === selectedMessage.id
              ? {
                  ...msg,
                  replied: true,
                  replies: [
                    ...(msg.replies || []),
                    {
                      id: Date.now().toString(),
                      content: replyText,
                      timestamp: new Date().toISOString(),
                      sentBy: "current-user", // This would be replaced with actual user ID
                      sentByName: "You",
                    },
                  ],
                }
              : msg,
          ),
        )
      } else {
        setWhatsappMessages((prev) =>
          prev.map((msg) =>
            msg.id === selectedMessage.id
              ? {
                  ...msg,
                  replied: true,
                  replies: [
                    ...(msg.replies || []),
                    {
                      id: Date.now().toString(),
                      content: replyText,
                      timestamp: new Date().toISOString(),
                      sentBy: "current-user", // This would be replaced with actual user ID
                      sentByName: "You",
                    },
                  ],
                }
              : msg,
          ),
        )
      }

      setReplyText("")

      // Mark as read if it wasn't already
      if (!selectedMessage.read) {
        handleMarkAsRead(selectedMessage.id)
      }
    } catch (err) {
      console.error(`Error sending ${activeTab} reply:`, err)
      setError(`Erro ao enviar resposta no ${activeTab}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const endpoint = activeTab === "instagram" ? "/api/social/instagram" : "/api/social/whatsapp"

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          markAsRead: true,
        }),
      })

      // Update the message in the UI
      if (activeTab === "instagram") {
        setInstagramMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)))
      } else {
        setWhatsappMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)))
      }
    } catch (err) {
      console.error(`Error marking ${activeTab} message as read:`, err)
    }
  }

  const handleAssignToMe = async (messageId: string) => {
    try {
      const endpoint = activeTab === "instagram" ? "/api/social/instagram" : "/api/social/whatsapp"

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          assignTo: "current-user", // This would be replaced with actual user ID
        }),
      })

      // Update the message in the UI
      if (activeTab === "instagram") {
        setInstagramMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, assignedTo: "current-user" } : msg)),
        )
      } else {
        setWhatsappMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, assignedTo: "current-user" } : msg)),
        )
      }
    } catch (err) {
      console.error(`Error assigning ${activeTab} message:`, err)
    }
  }

  const handleCreateMockMessage = async () => {
    try {
      const endpoint = activeTab === "instagram" ? "/api/social/instagram" : "/api/social/whatsapp"

      const mockData =
        activeTab === "instagram"
          ? {
              mockMessage: {
                username: "cliente_instagram",
                content:
                  "Olá, gostaria de informações sobre pacotes para Cancún. Vocês têm disponibilidade para julho?",
              },
            }
          : {
              mockMessage: {
                name: "Cliente WhatsApp",
                phoneNumber: "+5567999999999",
                content: "Boa tarde! Estou interessado em pacotes para Gramado em dezembro. Podem me ajudar?",
              },
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockData),
      })

      if (!response.ok) throw new Error(`Failed to create mock ${activeTab} message`)

      // Refresh messages
      if (activeTab === "instagram") {
        fetchInstagramMessages()
      } else {
        fetchWhatsappMessages()
      }
    } catch (err) {
      console.error(`Error creating mock ${activeTab} message:`, err)
    }
  }

  const filteredMessages =
    activeTab === "instagram"
      ? instagramMessages.filter(
          (msg) =>
            msg.sender.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : whatsappMessages.filter(
          (msg) =>
            msg.sender.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
        )

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border-b">
          <TabsList className="mb-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="instagram"
              className="font-mon data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              onClick={() => {
                setSelectedMessage(null)
                setReplyText("")
              }}
            >
              <Instagram className="h-4 w-4 mr-2" />
              <span>Instagram</span>
              {instagramMessages.filter((m) => !m.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {instagramMessages.filter((m) => !m.read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="font-mon data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              onClick={() => {
                setSelectedMessage(null)
                setReplyText("")
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>WhatsApp</span>
              {whatsappMessages.filter((m) => !m.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {whatsappMessages.filter((m) => !m.read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar mensagens..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="filterUnread"
                  className="h-4 w-4 rounded text-primary-blue focus:ring-primary-blue"
                  checked={filterUnread}
                  onChange={() => setFilterUnread(!filterUnread)}
                />
                <label htmlFor="filterUnread" className="text-sm text-gray-700">
                  Não lidas
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="filterAssigned"
                  className="h-4 w-4 rounded text-primary-blue focus:ring-primary-blue"
                  checked={filterAssigned}
                  onChange={() => setFilterAssigned(!filterAssigned)}
                />
                <label htmlFor="filterAssigned" className="text-sm text-gray-700">
                  Atribuídas a mim
                </label>
              </div>
              <button
                onClick={activeTab === "instagram" ? fetchInstagramMessages : fetchWhatsappMessages}
                className="p-2 text-gray-600 hover:text-primary-blue hover:bg-gray-100 rounded-full"
                title="Atualizar"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleCreateMockMessage}
                className="p-2 text-gray-600 hover:text-primary-blue hover:bg-gray-100 rounded-full"
                title="Criar mensagem de teste"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          <div className="col-span-1 border-r overflow-y-auto">
            <TabsContent value="instagram" className="h-full m-0 p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
                  <span className="ml-2 text-gray-600 font-mon">Carregando mensagens...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mon">Nenhuma mensagem encontrada.</div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id ? "bg-gray-50" : ""
                      } ${!message.read ? "border-l-4 border-primary-blue" : ""}`}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (!message.read) {
                          handleMarkAsRead(message.id)
                        }
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {message.sender.profilePicture ? (
                            <Image
                              src={message.sender.profilePicture || "/placeholder.svg"}
                              alt={message.sender.username || "User"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-primary-blue text-white rounded-full flex items-center justify-center">
                              {message.sender.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          {!message.read && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-blue rounded-full"></div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">@{message.sender.username}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(message.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        {message.replied && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="whatsapp" className="h-full m-0 p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
                  <span className="ml-2 text-gray-600 font-mon">Carregando mensagens...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mon">Nenhuma mensagem encontrada.</div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id ? "bg-gray-50" : ""
                      } ${!message.read ? "border-l-4 border-green-500" : ""}`}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (!message.read) {
                          handleMarkAsRead(message.id)
                        }
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {message.sender.profilePicture ? (
                            <Image
                              src={message.sender.profilePicture || "/placeholder.svg"}
                              alt={message.sender.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                              {message.sender.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          {!message.read && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{message.sender.name}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(message.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        {message.replied && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>

          <div className="col-span-2 flex flex-col">
            {selectedMessage ? (
              <>
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {activeTab === "instagram" ? (
                        selectedMessage.sender.profilePicture ? (
                          <Image
                            src={selectedMessage.sender.profilePicture || "/placeholder.svg"}
                            alt={selectedMessage.sender.username || "User"}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-primary-blue text-white rounded-full flex items-center justify-center">
                            {selectedMessage.sender.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )
                      ) : selectedMessage.sender.profilePicture ? (
                        <Image
                          src={selectedMessage.sender.profilePicture || "/placeholder.svg"}
                          alt={selectedMessage.sender.name || "User"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                          {selectedMessage.sender.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {activeTab === "instagram"
                          ? `@${selectedMessage.sender.username}`
                          : selectedMessage.sender.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activeTab === "instagram" ? "Instagram" : `${selectedMessage.sender.phoneNumber} • WhatsApp`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMessage.assignedTo ? (
                      <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Atribuído
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssignToMe(selectedMessage.id)}
                        className="text-xs text-primary-blue hover:bg-blue-50 px-2 py-1 rounded-full flex items-center"
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Atribuir a mim
                      </button>
                    )}
                    {selectedMessage.read ? (
                      <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Lida
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-full flex items-center"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8">
                        {activeTab === "instagram" ? (
                          selectedMessage.sender.profilePicture ? (
                            <Image
                              src={selectedMessage.sender.profilePicture || "/placeholder.svg"}
                              alt={selectedMessage.sender.username || "User"}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs">
                              {selectedMessage.sender.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )
                        ) : selectedMessage.sender.profilePicture ? (
                          <Image
                            src={selectedMessage.sender.profilePicture || "/placeholder.svg"}
                            alt={selectedMessage.sender.name || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                            {selectedMessage.sender.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="ml-2 bg-gray-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">{selectedMessage.content}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(selectedMessage.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    {selectedMessage.replies?.map((reply) => (
                      <div key={reply.id} className="flex justify-end">
                        <div className="mr-2 bg-primary-blue text-white rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm">{reply.content}</p>
                          <p className="text-xs text-white/70 mt-1 flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(reply.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 bg-second-blue text-white rounded-full flex items-center justify-center text-xs">
                            {reply.sentByName?.charAt(0).toUpperCase() || "A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t">
                  <div className="flex items-center">
                    <textarea
                      className="flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon resize-none"
                      placeholder={`Digite sua resposta para ${
                        activeTab === "instagram" ? selectedMessage.sender.username : selectedMessage.sender.name
                      }...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                    />
                    <button
                      className="p-3 bg-primary-blue text-white rounded-r-md hover:bg-second-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-mon">Selecione uma mensagem para visualizar</p>
                <p className="text-sm font-mon mt-2">
                  Você pode responder diretamente do sistema para o{" "}
                  {activeTab === "instagram" ? "Instagram" : "WhatsApp"}
                </p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

