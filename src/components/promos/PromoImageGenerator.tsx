"use client"
import { useState, useRef, useEffect } from "react"
import { toPng } from "html-to-image"
import { Loader2, Download, ImageIcon, RefreshCw } from "lucide-react"

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
  const parcelas = Number.parseInt(promo.PARCELAS || "15", 10)
  const totalValue = Math.round(baseValue * parcelas * 2)

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

  // Fetch destination image
  const fetchDestinationImage = async () => {
    setIsLoadingImage(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          promo.DESTINO + " tourism",
        )}&orientation=portrait&per_page=1&client_id=RZEIOVfPhS7m9qvjUJJh3hRUz0H3rPqaYuUPf_Wh2mA`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        setDestinationImage(data.results[0].urls.regular)
      } else {
        // Fallback to a default image if no results
        setDestinationImage(`https://source.unsplash.com/random/1080x1920/?${encodeURIComponent(promo.DESTINO)}`)
      }
    } catch (error) {
      console.error("Error fetching destination image:", error)
      setError("Erro ao buscar imagem do destino. Tente novamente.")
      // Fallback to a default image
      setDestinationImage(`https://source.unsplash.com/random/1080x1920/?${encodeURIComponent(promo.DESTINO)}`)
    } finally {
      setIsLoadingImage(false)
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
        pixelRatio: 2,
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

  // Fetch image on component mount
  useEffect(() => {
    fetchDestinationImage()
  }, [promo.DESTINO])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4">
        <button
          onClick={fetchDestinationImage}
          disabled={isLoadingImage}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          {isLoadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Trocar imagem
        </button>

        <button
          onClick={generateImage}
          disabled={isGenerating || isLoadingImage || !destinationImage}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-second-blue transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Baixar imagem
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm w-full">{error}</div>}

      <div className="relative w-[540px] h-[960px] overflow-hidden border border-gray-300 rounded-lg shadow-lg">
        {isLoadingImage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-blue mb-2" />
              <p className="text-gray-600 font-mon">Carregando imagem...</p>
            </div>
          </div>
        ) : !destinationImage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 font-mon">Imagem não disponível</p>
            </div>
          </div>
        ) : null}

        {/* Template for the promotional image */}
        <div
          ref={templateRef}
          className="w-[540px] h-[960px] relative"
          style={{ transform: "scale(0.5)", transformOrigin: "top left" }}
        >
          <div className="absolute inset-0 w-[1080px] h-[1920px] bg-white overflow-hidden">
            {/* Background image with overlay */}
            {destinationImage && (
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${destinationImage})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
              </div>
            )}

            {/* Content container */}
            <div className="absolute inset-0 flex flex-col p-8">
              {/* Region tag */}
              <div className="self-end bg-primary-yellow text-primary-blue font-bold text-[48px] py-4 px-8 rounded-bl-[30px]">
                {getRegion(promo.DESTINO)}
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="bg-primary-blue/90 rounded-[50px] p-8 mt-8 max-w-[900px]">
                  {/* Destination */}
                  <h1 className="text-primary-yellow font-bold text-[100px] leading-tight">{promo.DESTINO}</h1>

                  {/* Hotel */}
                  <h2 className="text-white font-medium text-[48px] mb-4">{promo.HOTEL}</h2>

                  {/* Date */}
                  <p className="text-primary-yellow font-medium text-[40px] mb-8">{formatDateRange()}</p>

                  {/* Price */}
                  <div className="bg-primary-yellow text-primary-blue rounded-[30px] p-6 inline-block mb-8">
                    <div className="flex items-center">
                      <div className="text-[40px] font-bold mr-4">{parcelas}x de</div>
                      <div>
                        <div className="text-[40px] font-bold">R$</div>
                        <div className="text-[120px] font-bold leading-none">{totalValue}</div>
                      </div>
                    </div>
                    <div className="text-[32px]">no cartão e {parcelas - 1}x no boleto sem juros</div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-white text-[36px]">
                      <span className="text-primary-yellow mr-4">✈</span>
                      Aéreo ida e volta
                    </div>
                    <div className="flex items-center text-white text-[36px]">
                      <span className="text-primary-yellow mr-4">👤</span>
                      Valor por pessoa
                    </div>
                    <div className="flex items-center text-white text-[36px]">
                      <span className="text-primary-yellow mr-4">🌙</span>
                      {promo.NUMERO_DE_NOITES} Noites
                    </div>
                    <div className="flex items-center text-white text-[36px]">
                      <span className="text-primary-yellow mr-4">🍽</span>
                      {getRegimeAlimentacao()}
                    </div>
                  </div>

                  {/* Departure */}
                  <div className="bg-primary-yellow text-primary-blue rounded-[20px] p-4 inline-block text-[32px] font-medium">
                    saindo de
                    <br />
                    {getDepartureAirport()}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto">
                <div className="text-white text-[28px] mb-4 text-center">
                  Preço por pessoa em apartamento duplo, sujeito a alteração sem aviso prévio.Taxas inclusas.
                </div>

                {/* Contact */}
                <div className="flex items-center bg-primary-yellow text-primary-blue p-4 rounded-t-[20px] max-w-[500px]">
                  <div className="bg-primary-yellow p-2 rounded-full mr-4">
                    <span className="text-[60px]">📱</span>
                  </div>
                  <div>
                    <div className="text-[36px] font-bold">Contato e Whatsapp</div>
                    <div className="text-[40px] font-bold">(67) 9637-2769</div>
                  </div>
                </div>

                {/* Logo area */}
                <div className="bg-gradient-to-r from-primary-blue to-primary-yellow h-[200px] flex items-center p-8">
                  <div className="text-white text-[100px] font-bold">
                    Donatti
                    <span className="text-primary-yellow">TURISMO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

