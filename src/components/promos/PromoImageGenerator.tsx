"use client"
import { useState, useRef, useEffect } from "react"
import { toPng } from "html-to-image"
import { Loader2, Download, RefreshCw } from "lucide-react"

interface PromoImageGeneratorProps {
  promo: any
}

export function PromoImageGenerator({ promo }: PromoImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [destinationImage, setDestinationImage] = useState<string | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const templateRef = useRef<HTMLDivElement>(null)

  // Calculate values
  const baseValue = Number.parseFloat(promo.VALOR)
  const parcelas = Number.parseInt(promo.PARCELAS || "10", 10)

  // Fetch destination image when component mounts or destination changes
  useEffect(() => {
    fetchDestinationImage()
  }, [promo.DESTINO])

  // Function to fetch destination image from Unsplash API
  const fetchDestinationImage = async () => {
    if (!promo.DESTINO) return

    setIsLoadingImage(true)
    setError(null)

    try {
      // Using Unsplash API to search for destination images
      const response = await fetch(`/api/image-search?query=${encodeURIComponent(promo.DESTINO + " turismo")}`)

      if (!response.ok) {
        throw new Error("Failed to fetch destination image")
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        // Get the first image result
        setDestinationImage(data.results[0].urls.regular)
      } else {
        setError("Não foi possível encontrar imagens para este destino")
      }
    } catch (err) {
      console.error("Error fetching destination image:", err)
      setError("Erro ao buscar imagem do destino")
    } finally {
      setIsLoadingImage(false)
    }
  }

  // Get region based on destination
  const getRegion = (destination: string) => {
    const northeastCities = [
      "natal",
      "recife",
      "fortaleza",
      "salvador",
      "maceió",
      "joão pessoa",
      "aracaju",
      "são luís",
      "teresina",
      "porto de galinhas",
      "porto seguro",
      "pipa",
    ]
    const southCities = ["florianópolis", "porto alegre", "gramado", "curitiba", "foz do iguaçu", "balneário camboriú"]
    const southeastCities = [
      "rio de janeiro",
      "são paulo",
      "belo horizonte",
      "vitória",
      "búzios",
      "paraty",
      "campos do jordão",
    ]
    const centralCities = ["brasília", "goiânia", "cuiabá", "campo grande", "bonito", "caldas novas"]
    const northCities = ["manaus", "belém", "palmas", "rio branco", "porto velho", "boa vista", "macapá"]

    const dest = destination.toLowerCase()

    if (northeastCities.some((city) => dest.includes(city))) return "Nordeste"
    if (southCities.some((city) => dest.includes(city))) return "Sul"
    if (southeastCities.some((city) => dest.includes(city))) return "Sudeste"
    if (centralCities.some((city) => dest.includes(city))) return "Centro-Oeste"
    if (northCities.some((city) => dest.includes(city))) return "Norte"

    return "Brasil" // Default
  }

  // Get regime de alimentação
  const getRegimeAlimentacao = () => {
    if (promo.ALL_INCLUSIVE) return "All inclusive"
    if (promo.PENSAO_COMPLETA) return "Pensão completa"
    if (promo.MEIA_PENSAO) return "Meia pensão"
    if (promo.COM_CAFE) return "Com café da manhã"
    if (promo.SEM_CAFE) return "Sem café da manhã"
    return "Sem café da manhã"
  }

  // Get departure airport
  const getDepartureAirport = () => {
    if (promo.CG && !promo.SP) return "Campo Grande (CGR)"
    if (promo.SP && !promo.CG) return "São Paulo (GRU)"
    if (promo.CG && promo.SP) return "Campo Grande (CGR) ou São Paulo (GRU)"
    return "Campo Grande (CGR)"
  }

  // Format date range
  const formatDateRange = () => {
    try {
      // Extract dates from DATA_FORMATADA
      const datePattern = /(\d{1,2})\/(\d{1,2}) até (\d{1,2})\/(\d{1,2}) de (\d{4})/
      const match = promo.DATA_FORMATADA.match(datePattern)

      if (match) {
        const [_, startDay, startMonth, endDay, endMonth, year] = match
        return `${startDay}/${startMonth} até ${endDay}/${endMonth} de ${year}`
      }

      return promo.DATA_FORMATADA
    } catch (error) {
      console.error("Error formatting date range:", error)
      return promo.DATA_FORMATADA
    }
  }

  // Generate and download image
  const generateImage = async () => {
    if (!templateRef.current) return

    setIsGenerating(true)

    try {
      const dataUrl = await toPng(templateRef.current, {
        quality: 0.95,
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        skipAutoScale: true,
        canvasWidth: 1080,
        canvasHeight: 1920,
      })

      // Create download link
      const link = document.createElement("a")
      link.download = `promo-${promo.DESTINO.toLowerCase().replace(/\s+/g, "-")}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error generating image:", error)
      setError("Erro ao gerar imagem. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4">
        <button
          onClick={fetchDestinationImage}
          disabled={isLoadingImage}
          className="flex items-center gap-2 px-4 py-2 bg-second-blue text-white rounded-md hover:bg-primary-blue transition-colors disabled:opacity-50"
        >
          {isLoadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Buscar imagem
        </button>

        <button
          onClick={generateImage}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-second-blue transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Baixar imagem
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm w-full">{error}</div>}

      <div className="relative w-[540px] h-[960px] overflow-hidden border border-gray-300 rounded-lg shadow-lg">
        {/* Template for the promotional image */}
        <div
          ref={templateRef}
          className="w-[1080px] h-[1920px]"
          style={{ transform: "scale(0.5)", transformOrigin: "top left" }}
        >
          {/* Main background */}
          <div className="w-full h-full bg-white">
            {/* Blue background area */}
            <div className="w-[800px] h-[1400px] bg-[#002043] mx-auto mt-[100px] rounded-[60px] relative overflow-hidden">
              {/* Destination image overlay */}
              {destinationImage && (
                <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#002043] opacity-80"></div>
                  <img
                    src={destinationImage || "/placeholder.svg"}
                    alt={promo.DESTINO}
                    className="w-full h-full object-cover opacity-40"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {/* Region Tag */}
              <div className="absolute top-[100px] right-0 bg-[#FEB100] text-[#002043] font-bold text-[50px] py-4 px-8 rounded-l-[20px]">
                {getRegion(promo.DESTINO)}
              </div>

              {/* Destination */}
              <div className="absolute top-[180px] left-[60px] text-[#FEB100] font-bold text-[80px] leading-tight">
                {promo.DESTINO}
              </div>

              {/* Hotel */}
              <div className="absolute top-[280px] left-[60px] text-white font-medium text-[60px]">{promo.HOTEL}</div>

              {/* Date */}
              <div className="absolute top-[350px] left-[60px] text-[#FEB100] font-medium text-[40px]">
                {formatDateRange()}
              </div>

              {/* Price Box */}
              <div className="absolute top-[450px] right-0 bg-[#FEB100] text-[#002043] py-6 px-8 rounded-l-[20px] w-[600px]">
                <div className="flex items-center">
                  <div className="text-[40px] font-bold mr-2">R$</div>
                  <div className="text-[40px] font-bold mr-2">{parcelas}x de</div>
                </div>
                <div className="text-[100px] font-bold leading-none">{baseValue.toFixed(2).replace(".", ",")}</div>
                <div className="text-[30px] font-medium">no cartão e {parcelas - 1}x no boleto sem juros.</div>
              </div>

              {/* Features */}
              <div className="absolute top-[650px] left-[60px] space-y-6">
                <div className="flex items-center">
                  <span className="text-[#FEB100] text-[40px] mr-4">✈</span>
                  <span className="text-white font-medium text-[40px]">Aéreo Ida e Volta</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#FEB100] text-[40px] mr-4">👤</span>
                  <span className="text-white font-medium text-[40px]">Valor por pessoa</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#FEB100] text-[40px] mr-4">🌙</span>
                  <span className="text-white font-medium text-[40px]">{promo.NUMERO_DE_NOITES} Noites</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#FEB100] text-[40px] mr-4">🍽</span>
                  <span className="text-white font-medium text-[40px]">{getRegimeAlimentacao()}</span>
                </div>
              </div>

              {/* Departure */}
              <div className="absolute top-[900px] left-0 bg-[#FEB100] text-[#002043] py-4 px-8 rounded-r-[20px]">
                <div className="text-[30px] font-bold">saindo de</div>
                <div className="text-[30px] font-bold">{getDepartureAirport()}</div>
              </div>

              {/* Fine print */}
              <div className="absolute top-[1000px] left-[60px] text-white text-[20px] max-w-[680px]">
                Preço por pessoa em apartamento duplo, sujeito a alteração sem aviso prévio, taxas inclusas.
              </div>

              {/* Contact */}
              <div className="absolute bottom-[100px] left-[60px] flex items-center">
                <div className="bg-[#FEB100] p-4 rounded-[20px] mr-4">
                  <span className="text-[#002043] text-[40px]">📱</span>
                </div>
                <div>
                  <div className="text-white font-bold text-[30px]">Contato e Whatsapp</div>
                  <div className="text-white font-bold text-[30px]">(67) 9 9637-2769</div>
                </div>
              </div>
            </div>

            {/* Footer with logo */}
            <div className="w-full h-[300px] bg-gradient-to-r from-[#002043] to-[#FEB100] mt-[50px] relative">
              <div className="absolute left-[60px] top-[50%] transform translate-y-[-50%]">
                <div className="text-white font-bold text-[80px]">Donatti</div>
                <div className="text-white font-medium text-[40px] ml-[120px] -mt-[20px]">TURISMO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

