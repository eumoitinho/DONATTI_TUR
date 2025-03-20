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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm w-full">
          {error}
        </div>
      )}

      <div className="relative w-[540px] h-[960px] overflow-hidden border border-gray-300 rounded-lg shadow-lg">
        <div ref={templateRef} className="w-full h-full relative bg-white">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-Nm0qGvGrga4tctVRGZwoeL4lKl0DU2.png"
            alt="Promo Template"
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-10 right-10 bg-yellow-500 text-blue-900 font-bold text-lg px-4 py-2 rounded">
            {getRegion(promo.DESTINO)}
          </div>
          
          <div className="absolute top-24 left-10 text-yellow-400 font-bold text-4xl">
            {promo.DESTINO}
          </div>
          <div className="absolute top-32 left-10 text-white font-medium text-2xl">
            {promo.HOTEL}
          </div>
          
          <div className="absolute top-40 left-10 text-yellow-400 font-medium text-xl">
            {formatDateRange()}
          </div>
          
          <div className="absolute top-52 left-10 text-blue-900 font-bold text-2xl">
            {parcelas}x de R$
            <span className="text-5xl"> {totalValue},00</span>
          </div>
          
          <div className="absolute top-60 left-10 text-blue-900 font-medium text-lg">
            no cartão e {parcelas - 1}x no boleto sem juros.
          </div>
          
          <div className="absolute top-72 left-10 flex flex-col gap-2 text-yellow-400 font-medium text-xl">
            <div>Aéreo Ida e Volta</div>
            <div>Valor por pessoa</div>
            <div>{promo.NUMERO_DE_NOITES} Noites</div>
            <div>{getRegimeAlimentacao()}</div>
          </div>
          
          <div className="absolute top-96 left-10 text-blue-900 font-bold text-lg">
            saindo de {getDepartureAirport()}
          </div>
          
          <div className="absolute top-[460px] left-10 text-white text-sm max-w-[300px]">
            Preço por pessoa em apartamento duplo, sujeito a alteração sem aviso prévio, taxas inclusas.
          </div>
          
          <div className="absolute bottom-10 left-10 bg-white p-4 rounded-md shadow-md">
            <div className="text-blue-900 font-bold text-lg">Contato e Whatsapp</div>
            <div className="text-blue-900 font-bold text-lg">(67) 9 9637-2769</div>
          </div>
        </div>
      </div>
    </div>
  );
}

