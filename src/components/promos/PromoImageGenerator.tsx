"use client"
import { useState, useRef } from "react"
import { toPng } from "html-to-image"
import { Loader2, Download } from "lucide-react"

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

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4">
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
          className="w-[540px] h-[960px] relative"
          style={{ transform: "scale(0.5)", transformOrigin: "top left" }}
        >
          <div className="absolute inset-0 w-[1080px] h-[1920px] font-neo">
            {/* Background template image */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-4hSeVbtcrqJCRT50o2nnmDod7tuYeS.png"
              alt="Promo Template"
              className="w-full h-full object-cover"
            />

            {/* Text Overlay */}
            <div className="absolute inset-0">
              {/* Region Tag */}
              <div className="absolute top-[207px] right-[0] text-[#002043] font-bold text-[60px] py-6 px-10">
                {getRegion(promo.DESTINO)}
              </div>

              {/* Destination */}
              <div className="absolute top-[313px] left-[387px] text-[#e2aa2d] font-bold text-[80px]">
                {promo.DESTINO}
              </div>

              {/* Hotel */}
              <div className="absolute top-[367px] left-[387px] text-white font-medium text-[60px]">{promo.HOTEL}</div>

              {/* Date */}
              <div className="absolute top-[410px] left-[387px] text-[#e2aa2d] font-medium text-[40px]">
                {formatDateRange()}
              </div>

              {/* Price */}
              <div className="absolute top-[486px] left-[401px] text-[#002043] font-bold text-[40px]">
                {parcelas}x de
              </div>
              <div className="absolute top-[486px] left-[520px] text-[#002043] font-bold text-[40px]">R$</div>
              <div className="absolute top-[470px] left-[580px] text-[#002043] font-bold text-[100px]">
                {totalValue},00
              </div>
              <div className="absolute top-[571px] left-[401px] text-[#002043] font-medium text-[30px]">
                no cartão e {parcelas - 1}x no boleto sem juros.
              </div>

              {/* Features */}
              <div className="absolute top-[650px] left-[407px] text-[#e2aa2d] font-medium text-[40px]">
                Aéreo Ida e Volta
              </div>
              <div className="absolute top-[689px] left-[407px] text-[#e2aa2d] font-medium text-[40px]">
                Valor por pessoa
              </div>
              <div className="absolute top-[727px] left-[407px] text-[#e2aa2d] font-medium text-[40px]">
                {promo.NUMERO_DE_NOITES} Noites
              </div>
              <div className="absolute top-[765px] left-[407px] text-[#e2aa2d] font-medium text-[40px]">
                {getRegimeAlimentacao()}
              </div>

              {/* Departure */}
              <div className="absolute top-[816px] left-[345px] text-[#002043] font-bold text-[30px]">saindo de</div>
              <div className="absolute top-[833px] left-[312px] text-[#002043] font-bold text-[30px]">
                {getDepartureAirport()}
              </div>

              {/* Contact */}
              <div className="absolute top-[961px] left-[433px] text-[#002043] font-bold text-[40px]">
                Contato e Whatsapp
              </div>
              <div className="absolute top-[992px] left-[445px] text-[#002043] font-bold text-[40px]">
                (67) 9 9637-2769
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

