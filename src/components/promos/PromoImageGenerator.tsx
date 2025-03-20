"use client"
import { useState, useRef, useEffect } from "react"
import { toPng } from "html-to-image"
import { Loader2, Download, ImageIcon, RefreshCw } from "lucide-react"
import { AirplaneIcon } from "../icons/AirplaneIcon"
import { PersonIcon } from "../icons/PersonIcon"
import { MoonIcon } from "../icons/MoonIcon"
import { FoodIcon } from "../icons/FoodIcon"
import { PhoneIcon } from "../icons/PhoneIcon"

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

  // Fetch destination image using Pexels API instead of Unsplash
  const fetchDestinationImage = async () => {
    setIsLoadingImage(true)
    setError(null)

    try {
      // Using Pexels API for better travel images
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          promo.DESTINO + " travel",
        )}&orientation=portrait&per_page=1`,
        {
          headers: {
            Authorization: "563492ad6f91700001000001f89d893e82f44b0ba4f2c5eb6a44a8f1", // Public Pexels API key
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }

      const data = await response.json()

      if (data.photos && data.photos.length > 0) {
        setDestinationImage(data.photos[0].src.large2x)
      } else {
        // Fallback to a default image if no results
        setDestinationImage(
          `https://source.unsplash.com/random/1080x1920/?${encodeURIComponent(promo.DESTINO + " travel")}`,
        )
      }
    } catch (error) {
      console.error("Error fetching destination image:", error)
      setError("Erro ao buscar imagem do destino. Tente novamente.")
      // Fallback to a default image
      setDestinationImage(
        `https://source.unsplash.com/random/1080x1920/?${encodeURIComponent(promo.DESTINO + " travel")}`,
      )
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

        {/* Template for the promotional image - Exact Figma layout */}
        <div
          ref={templateRef}
          className="w-[540px] h-[960px] relative"
          style={{ transform: "scale(0.5)", transformOrigin: "top left" }}
        >
          <div className="absolute inset-0 w-[1080px] h-[1920px] bg-white overflow-hidden font-neo">
            {/* Background image with overlay */}
            {destinationImage && (
              <div className="absolute inset-0 z-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${destinationImage})` }}
                />
                <div className="absolute inset-0 bg-donatti-blue opacity-70"></div>
              </div>
            )}

            {/* Main content area */}
            <div className="absolute top-0 left-0 right-0 h-[1400px] overflow-hidden z-10">
              {/* Region tag */}
              <div className="absolute top-0 right-0 bg-donatti-yellow text-donatti-blue font-bold text-[60px] py-6 px-10 rounded-bl-[30px]">
                {getRegion(promo.DESTINO)}
              </div>

              {/* Main content */}
              <div className="pt-[250px] px-[80px]">
                {/* Destination */}
                <h1 className="text-donatti-yellow font-bold text-[120px] leading-tight">{promo.DESTINO}</h1>

                {/* Hotel */}
                <h2 className="text-white font-medium text-[80px] mb-4">{promo.HOTEL}</h2>

                {/* Date */}
                <p className="text-donatti-yellow font-medium text-[60px] mb-8">{formatDateRange()}</p>

                {/* Price */}
                <div className="bg-donatti-yellow text-donatti-blue rounded-[50px] p-8 mb-12">
                  <div className="flex items-center">
                    <div className="text-[50px] font-bold mr-4">{parcelas}x de</div>
                    <div className="flex items-baseline">
                      <div className="text-[50px] font-bold mr-2">R$</div>
                      <div className="text-[120px] font-bold leading-none">{totalValue},00</div>
                    </div>
                  </div>
                  <div className="text-[40px] font-medium">no cartão e {parcelas - 1}x no boleto sem juros.</div>
                </div>

                {/* Features */}
                <div className="space-y-6 mb-12">
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-donatti-yellow mr-6">
                      <AirplaneIcon width={60} height={60} />
                    </div>
                    Aéreo Ida e Volta
                  </div>
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-donatti-yellow mr-6">
                      <PersonIcon width={60} height={60} />
                    </div>
                    Valor por pessoa
                  </div>
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-donatti-yellow mr-6">
                      <MoonIcon width={60} height={60} />
                    </div>
                    {promo.NUMERO_DE_NOITES} Noites
                  </div>
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-donatti-yellow mr-6">
                      <FoodIcon width={60} height={60} />
                    </div>
                    {getRegimeAlimentacao()}
                  </div>
                </div>

                {/* Departure */}
                <div className="bg-donatti-yellow text-donatti-blue rounded-[30px] p-6 inline-block text-[40px] font-bold">
                  saindo de
                  <br />
                  {getDepartureAirport()}
                </div>
              </div>

              {/* Fine print */}
              <div className="absolute bottom-[100px] left-0 right-0 text-center text-white text-[30px] px-[80px]">
                Preço por pessoa em apartamento duplo, sujeito a alteração sem aviso prévio, taxas inclusas.
              </div>
            </div>

            {/* Contact section */}
            <div className="absolute bottom-[300px] left-0 right-0 z-10">
              <div className="flex items-center bg-donatti-yellow text-donatti-blue p-6 max-w-[600px]">
                <div className="bg-donatti-yellow p-2 rounded-full mr-6">
                  <PhoneIcon width={80} height={80} />
                </div>
                <div>
                  <div className="text-[40px] font-bold">Contato e Whatsapp</div>
                  <div className="text-[50px] font-bold">(67) 9637-2769</div>
                </div>
              </div>
            </div>

            {/* Footer with logo */}
            <div className="absolute bottom-0 left-0 right-0 h-[200px] z-10">
              <div className="relative h-full">
                <div
                  className="absolute bottom-0 left-0 right-0 h-[200px] bg-donatti-blue"
                  style={{ clipPath: "polygon(0 0, 100% 100%, 100% 0)" }}
                ></div>
                <div
                  className="absolute bottom-0 right-0 h-[200px] w-[60%] bg-donatti-yellow"
                  style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
                ></div>
                <div className="absolute bottom-[50px] left-[80px] text-white text-[100px] font-bold">
                  D<span className="text-donatti-yellow">o</span>natti
                  <span className="text-[60px] ml-4">TURISMO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

