"use client"
import { useState } from "react"
import { usePromo } from "@/hooks/usePromo"
import {
  Calendar,
  MapPin,
  Hotel,
  DollarSign,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Image,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PromoImageGeneratorModal } from "./PromoImageGeneratorModal"

interface PromoData {
  id: string
  DESTINO: string
  HOTEL: string
  DATA_FORMATADA: string
  VALOR: string
  COM_CAFE?: boolean
  SEM_CAFE?: boolean
  MEIA_PENSAO?: boolean
  PENSAO_COMPLETA?: boolean
  ALL_INCLUSIVE?: boolean
  NUMERO_DE_NOITES?: string
  SP?: boolean
  CG?: boolean
  AEREO?: boolean
  createdAt: string
  updatedAt: string
}

interface PromosListProps {
  promos: PromoData[]
  onEdit: (promo: PromoData) => void
  onDelete: () => void
}

export function PromosList({ promos, onEdit, onDelete }: PromosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDestino, setSelectedDestino] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [selectedPromoForImage, setSelectedPromoForImage] = useState<PromoData | null>(null)

  const { deletePromo, isLoading } = usePromo()

  const parseCurrencyValue = (value: string) => {
    if (!value) {
      return "0,00"
    }

    const cleanedValue = value.replace(/[^\d.,]/g, "")
    const numericValue = Number.parseFloat(cleanedValue.replace(",", "."))
    const valueAfterCalculation = numericValue * 15 * 2

    return valueAfterCalculation.toFixed(2).replace(".", ",")
  }

  const getInstallmentValue = (value: string) => {
    if (!value) {
      return "0,00"
    }

    const cleanedValue = value.replace(/[^\d.,]/g, "")
    const numericValue = Number.parseFloat(cleanedValue.replace(",", "."))
    const installmentValue = (numericValue * 2 * 15) / 15

    return installmentValue.toFixed(2).replace(".", ",")
  }

  const getRegimeAlimentacao = (promo: PromoData): string => {
    if (promo.ALL_INCLUSIVE) return "All Inclusive"
    if (promo.PENSAO_COMPLETA) return "Pensão Completa"
    if (promo.MEIA_PENSAO) return "Meia Pensão"
    if (promo.COM_CAFE) return "Com Café"
    if (promo.SEM_CAFE) return "Sem Café"
    return "Não especificado"
  }

  const getAeroportoSaida = (promo: PromoData): string => {
    if (promo.CG && promo.SP) return "Campo Grande e São Paulo"
    if (promo.CG) return "Campo Grande"
    if (promo.SP) return "São Paulo"
    return "Não especificado"
  }

  // Get unique destinations for filter
  const destinos = [...new Set(promos.map((promo) => promo.DESTINO))].sort()

  // Filter and sort promos
  const filteredPromos = promos
    .filter((promo) => {
      const matchesSearch =
        searchTerm === "" ||
        promo.DESTINO.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.HOTEL.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.DATA_FORMATADA.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDestino = selectedDestino === null || promo.DESTINO === selectedDestino

      return matchesSearch && matchesDestino
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortField === "DESTINO") {
        comparison = a.DESTINO.localeCompare(b.DESTINO)
      } else if (sortField === "VALOR") {
        const valueA = Number.parseFloat(a.VALOR.replace(",", "."))
        const valueB = Number.parseFloat(b.VALOR.replace(",", "."))
        comparison = valueA - valueB
      } else if (sortField === "DATA_FORMATADA") {
        comparison = a.DATA_FORMATADA.localeCompare(b.DATA_FORMATADA)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deletePromo(deleteConfirmId)
      setDeleteConfirmId(null)
      onDelete()
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const handleGenerateImage = (promo: PromoData) => {
    setSelectedPromoForImage(promo)
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null

    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-grow">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar promoções..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-64">
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                value={selectedDestino || ""}
                onChange={(e) => setSelectedDestino(e.target.value || null)}
              >
                <option value="">Todos os destinos</option>
                {destinos.map((destino) => (
                  <option key={destino} value={destino}>
                    {destino}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredPromos.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mon">
            {promos.length === 0
              ? "Nenhuma promoção cadastrada. Adicione sua primeira promoção!"
              : "Nenhuma promoção encontrada com os filtros atuais."}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Data de Envio
                    {renderSortIcon("createdAt")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("DATA_FORMATADA")}
                >
                  <div className="flex items-center">
                    Data da Viagem
                    {renderSortIcon("DATA_FORMATADA")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("DESTINO")}
                >
                  <div className="flex items-center">
                    Destino
                    {renderSortIcon("DESTINO")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Hotel
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("VALOR")}
                >
                  <div className="flex items-center">
                    Valor
                    {renderSortIcon("VALOR")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Detalhes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPromos.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 font-mon">
                        {format(parseISO(promo.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 font-mon">{promo.DATA_FORMATADA}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 font-mon">{promo.DESTINO}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Hotel className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 font-mon">{promo.HOTEL}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-primary-blue font-mon">
                          R$ {parseCurrencyValue(promo.VALOR)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 ml-6 mt-1">
                        ou 15x de R$ {getInstallmentValue(promo.VALOR)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="font-medium">Regime:</span> {getRegimeAlimentacao(promo)}
                      </div>
                      {promo.NUMERO_DE_NOITES && (
                        <div className="text-xs">
                          <span className="font-medium">Noites:</span> {promo.NUMERO_DE_NOITES}
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="font-medium">Saída:</span> {getAeroportoSaida(promo)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deleteConfirmId === promo.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleConfirmDelete}
                          disabled={isLoading}
                          className="text-white bg-red-600 hover:bg-red-700 p-1.5 rounded"
                        >
                          {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="text-gray-600 hover:text-gray-800 p-1.5 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGenerateImage(promo)}
                          className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50"
                          title="Gerar imagem promocional"
                        >
                          <Image className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(promo)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(promo.id)}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Image Generator Modal */}
      {selectedPromoForImage && (
        <PromoImageGeneratorModal
          isOpen={!!selectedPromoForImage}
          onClose={() => setSelectedPromoForImage(null)}
          promo={selectedPromoForImage}
        />
      )}
    </div>
  )
}

