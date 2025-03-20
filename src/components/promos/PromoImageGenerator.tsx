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
        height: 1660,
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

      <div className="relative w-[540px] h-[830px] overflow-hidden border border-gray-300 rounded-lg shadow-lg">
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

        {/* Template for the promotional image using the SVG layout */}
        <div
          ref={templateRef}
          className="w-[540px] h-[830px] relative"
          style={{ transform: "scale(0.5)", transformOrigin: "top left" }}
        >
          <div className="absolute inset-0 w-[1080px] h-[1660px] font-neo">
            {/* Background image with overlay */}
            {destinationImage && (
              <div className="absolute inset-0 z-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${destinationImage})`, opacity: 0.3 }}
                />
              </div>
            )}

            {/* SVG Layout */}
            <svg viewBox="0 0 1080 1660" className="absolute inset-0 w-full h-full">
              <defs>
                <style>
                  {`
                    .cls-1 { fill: #fff; }
                    .cls-2 { fill: #f5a406; }
                    .cls-3 { fill: #002043; }
                    .cls-4 { fill: #fefefe; }
                  `}
                </style>
              </defs>
              <path
                className="cls-3"
                d="M235,1419l845,199v42H0v-295c2.06-.22,4.02.07,6.04.45,76.18,14.33,152.51,39.38,228.96,53.55ZM210,1504.01c-4.78-.72-8.66,1.47-12.51,3.99-1.26-3.66-5.13-3.01-8.48-2.99l4.99,4.98c-2.53,1.1-4.94.79-7.48,1.04-1.06.1-3.37-.63-2.5,1.46,2.68,6.47,12.15.67,12.99,1.52.6.96-2.85,10.33.49,8.99s3.65-9.66,5.44-12.32c1.09-1.61,7.53-2.67,7.07-6.67ZM411.72,1504.23c-6.35,1.3-8.38,6.27-7.75,12.29,1.24,11.96,21.54,11.71,23.82,1.77,2.64-11.53-5.57-16.22-16.06-14.07ZM146.45,1536.24c-2.67-10.73-8.32-19.48-18.46-23.72-2.45-1.02-10.3-3.51-12.49-3.51h-35.5v70h36.5c1.53,0,9.52-2.68,11.49-3.51,7.51-3.17,12.19-8.51,16.39-15.61,4.45,14.09,18.22,23.07,32.91,21.47,14.69-1.61,26.19-13.37,27.48-28.08s-7.99-28.3-22.17-32.44-29.31,2.31-36.14,15.41ZM346.5,1514c-4.59-1.41-16.05,1.04-21.5,0v13s-7.56.93-7.56.93l-.45,11.06c-2.01-1.19-2.66-4.16-4.46-6.03-10.15-10.56-34.15-7.24-46.41-1.84l3.88,14.87c6.32-2.21,23.96-9.21,24.99.99-10.7-.17-27.24-.64-31.01,12-1.64.27-.94-1.34-.99-2.47-.31-6.55-.07-15.29-2.82-21.19-4.29-9.19-16.05-11.15-24.86-7.51l-6.3,5.18v-6h-23.01v52h23v-29.5c0-6.18,10-5,10-2v31.5h24l.5-11.01c3.2,13.21,23.32,16.43,32,7.01.75-.35.58,4,2,4h21.5l-1-35c2.15.11,6.05-.85,6.86,1.64,1.52,4.66-.67,16.43.38,22.62,2.53,15.08,21.59,12.28,32.71,10.69l-.95-17.95c-3.34.54-5.68,1.45-8.99,0v-17h10v-17h-10c-.42-2.59,1.22-12.16-1.5-13ZM389.5,1514c-4.58-1.41-16.05,1.04-21.5,0v13c-12.45-2.5-6.86,8.96-8,17,2.3.21,7-1.03,7.87,1.63,1.36,4.15-.45,15.45.13,20.87,1.82,16.98,20.52,14.15,32.95,12.45l-.95-17.95c-3.34.54-5.68,1.45-8.99,0v-17h10v-17h-10c-.42-2.59,1.22-12.16-1.5-13ZM428,1527h-24v52h24v-52ZM186.01,1585.01c-6.07-.89-12.32-1.49-18.5-1-.94.07-7.93,1.11-5.51,2.99.86.67,13.37,1.12,15.5,1,1.83-.11,5.06-.67,6.98-1.03,1.64-.3,1.73.68,1.52-1.96ZM284,1588h-15v4s5.01,0,5.01,0c1.44,1.43-3.44,16.48,5.01,12.44l-.02-12.44h5.01s0-4,0-4ZM298,1588h-3.99c.55,5.06-2.38,15.19,4.71,16.79,12.24,2.77,10.49-8.54,10.28-16.79h-3.99c-.78,4.36,2.48,13.09-3.5,13.09-5.99,0-2.73-8.73-3.5-13.09ZM321,1588v17c5.87,2.09,3.1-4.5,5.51-5,2.93-.61,4.1,7.23,8.48,4.99.79-2.12-2.07-3.95-1.86-5.32.33-2.16,4.87-3.78,1.93-8.23s-9.42-3.4-14.07-3.44ZM351,1588h-4v17h4v-17ZM375,1592c.56-.52.11-3.29-1.65-3.84-5.43-1.7-13.68,1.48-9.87,7.87,1.38,2.32,9.68,1.87,8.51,4.46-1.85,4.09-8.22-1.3-8.99-.48-2.69,6.13,9.4,6.12,11.76,3.76,1.25-1.25,1.73-5.2.77-6.79-1.4-2.3-9.68-1.88-8.52-4.46,1.52-3.2,6.88.52,7.99-.52ZM387,1588v17h4s.01-8,.01-8c2.08.26,3.68,5.9,4.52,6.05,4.1.71,3.4-4.81,6.46-6.05v8s4.01,0,4.01,0v-17c-5.65-1.42-6.32,6.55-9.5,10.01-.97,0-4.51-12.75-9.5-10.01ZM435.21,1596.53c0-4.92-3.99-8.91-8.91-8.91s-8.91,3.99-8.91,8.91,3.99,8.91,8.91,8.91,8.91-3.99,8.91-8.91Z"
              />
              <path
                className="cls-2"
                d="M1080,1463v155l-845-199c275.92,14.04,552.1,29.05,827.49,43.01,5.55.28,11.59,1.82,17.51.99Z"
              />
              <path
                className="cls-2"
                d="M204.88,1550.56c0-17.11-13.87-30.97-30.97-30.97s-30.97,13.87-30.97,30.97,13.87,30.97,30.97,30.97,30.97-13.87,30.97-30.97ZM174.99,1575c4.46-12.29,23.1-32.92,9.53-45.01-11.86-10.57-29.89,1.44-26.05,16.05,1.38,5.26,10.96,22.51,14.3,27.68.62.97-.12,1.79,2.22,1.28Z"
              />
              <circle className="cls-2" cx="174.01" cy="1541.64" r="6.71" />
              <rect className="cls-4" x="1052" y="95" width="28" height="242" />
              <path
                className="cls-4"
                d="M346.5,1514c2.72.84,1.08,10.41,1.5,13.01h10s0,16.99,0,16.99h-10v17c3.32,1.46,5.65.54,8.99,0l.95,17.95c-11.12,1.59-30.18,4.39-32.71-10.69-1.04-6.19,1.15-17.97-.38-22.62-.81-2.49-4.72-1.53-6.86-1.64l1,35h-21.5c-1.41,0-1.24-4.35-2-4-8.68,9.41-28.8,6.2-32-7.01l-.5,11.01h-24v-31.5c0-3-10-4.18-10,2v29.5h-23v-52h23v6s6.31-5.18,6.31-5.18c8.81-3.63,20.57-1.68,24.86,7.51,2.75,5.9,2.52,14.64,2.82,21.19.05,1.13-.64,2.74.99,2.47,3.77-12.64,20.31-12.17,31.01-12-1.03-10.2-18.67-3.21-24.99-.99l-3.88-14.87c12.26-5.4,36.26-8.72,46.41,1.84,1.79,1.87,2.44,4.83,4.46,6.03l.45-11.06,7.57-.93v-13c5.45,1.04,16.91-1.41,21.5,0ZM296,1558c-3.03-.2-9.71-.41-10.04,3.51-.69,8.18,13.58,6.53,10.04-3.51Z"
              />
              <path
                className="cls-4"
                d="M146.45,1536.24c-3.8,7.29-4.55,15.8-2.07,23.65-4.2,7.1-8.87,12.43-16.39,15.61-1.96.83-9.95,3.51-11.49,3.51h-36.5v-70h35.5c2.19,0,10.04,2.49,12.49,3.51,10.15,4.24,15.79,12.99,18.46,23.72ZM103,1560c11.65.82,19.45-1.55,20.04-14.46.66-14.27-6.22-19.09-20.04-17.54v32Z"
              />
              <path
                className="cls-4"
                d="M389.5,1514c2.72.84,1.08,10.41,1.5,13.01h10s0,16.99,0,16.99h-10v17c3.32,1.46,5.65.54,8.99,0l.95,17.95c-12.43,1.71-31.14,4.53-32.95-12.45-.58-5.42,1.22-16.72-.13-20.87-.87-2.67-5.56-1.42-7.87-1.63,1.14-8.04-4.44-19.5,8.01-17v-13c5.45,1.04,16.91-1.41,21.5,0Z"
              />
              <rect className="cls-4" x="404" y="1527" width="24" height="52" />
              <path
                className="cls-4"
                d="M411.72,1504.23c10.49-2.15,18.7,2.54,16.06,14.07-2.27,9.93-22.58,10.18-23.82-1.77-.62-6.02,1.4-10.99,7.75-12.29Z"
              />
              <path
                className="cls-4"
                d="M387,1588c4.99-2.74,8.53,10.01,9.5,10.01,3.18-3.46,3.85-11.43,9.5-10.01v17h-4s-.01-8-.01-8c-3.06,1.24-2.36,6.76-6.46,6.05-.84-.15-2.44-5.78-4.52-6.05v8s-4.01,0-4.01,0v-17Z"
              />
              <path
                className="cls-4"
                d="M210,1504.01c.46,4-5.98,5.05-7.07,6.67-1.79,2.66-2.14,10.99-5.44,12.32s.11-8.03-.49-8.99c-.84-.85-10.31,4.95-12.99-1.52-.87-2.1,1.44-1.36,2.5-1.46,2.55-.25,4.95.06,7.48-1.04l-4.99-4.98c3.35-.01,7.22-.67,8.48,2.99,3.85-2.52,7.73-4.71,12.51-3.99Z"
              />
              <path
                className="cls-4"
                d="M321,1588c4.65.04,11.1-1.07,14.07,3.44s-1.6,6.08-1.93,8.23c-.21,1.37,2.65,3.21,1.86,5.32-4.38,2.24-5.55-5.6-8.48-4.99-2.41.5.36,7.08-5.51,5v-17ZM330.85,1596.86c4-2.81-2.18-6.53-5.85-4.86v5.01c1.51-.26,4.89.53,5.85-.15Z"
              />
              <path
                className="cls-4"
                d="M435.21,1596.53c0,4.92-3.99,8.91-8.91,8.91s-8.91-3.99-8.91-8.91,3.99-8.91,8.91-8.91,8.91,3.99,8.91,8.91ZM425.73,1591.17c-6.5.97-5.58,10.76.77,10.76,6.75,0,6.27-11.82-.77-10.76Z"
              />
              <path
                className="cls-4"
                d="M298,1588c.78,4.36-2.48,13.09,3.5,13.09,5.99,0,2.73-8.73,3.5-13.09h3.99c.21,8.26,1.95,19.56-10.28,16.79-7.09-1.61-4.16-11.74-4.71-16.79h3.99Z"
              />
              <path
                className="cls-4"
                d="M375,1592c-1.1,1.04-6.47-2.68-7.99.52-1.16,2.59,7.13,2.16,8.52,4.46.96,1.59.48,5.54-.77,6.79-2.36,2.36-14.45,2.37-11.76-3.76.77-.82,7.14,4.57,8.99.48,1.17-2.59-7.12-2.15-8.51-4.46-3.82-6.39,4.43-9.56,9.87-7.87,1.75.55,2.2,3.31,1.65,3.84Z"
              />
              <path
                className="cls-4"
                d="M284,1588v4s-5.01,0-5.01,0l.02,12.44c-8.45,4.04-3.57-11.02-5.01-12.44h-5.01s0-4,0-4h15Z"
              />
              <path
                className="cls-4"
                d="M186.01,1585.01c.21,2.64.11,1.66-1.52,1.96-1.92.35-5.15.92-6.98,1.03-2.12.13-14.63-.33-15.5-1-2.43-1.88,4.56-2.92,5.51-2.99,6.18-.49,12.43.11,18.5,1Z"
              />
              <rect className="cls-4" x="347" y="1588" width="4" height="17" />
              <path className="cls-3" d="M296,1558c3.54,10.04-10.73,11.69-10.04,3.51.33-3.92,7.01-3.71,10.04-3.51Z" />
              <path
                className="cls-3"
                d="M103,1560v-32c13.82-1.54,20.7,3.27,20.04,17.54-.59,12.91-8.39,15.28-20.04,14.46Z"
              />
              <path
                className="cls-3"
                d="M174.99,1575c-2.34.51-1.6-.32-2.22-1.28-3.33-5.17-12.91-22.42-14.3-27.68-3.84-14.61,14.19-26.62,26.05-16.05,13.57,12.1-5.07,32.72-9.53,45.01ZM180.72,1541.64c0-3.71-3-6.71-6.71-6.71s-6.71,3-6.71,6.71,3,6.71,6.71,6.71,6.71-3,6.71-6.71Z"
              />
              <path
                className="cls-3"
                d="M330.85,1596.86c-.96.68-4.34-.12-5.85.15v-5.01c3.67-1.67,9.85,2.06,5.85,4.86Z"
              />
              <path className="cls-3" d="M425.73,1591.17c7.04-1.06,7.52,10.76.77,10.76-6.35,0-7.27-9.79-.77-10.76Z" />
              <g>
                <path
                  className="cls-2"
                  d="M1052,337h28v221h-28c-161.07,0-322.42.96-483.35-1.15-41.39-6.33-73.19-42.8-75.7-84.3-2.24-37.12,1.68-76.58.15-113.94,1.58-10.73,9.09-19.06,19.84-21.16,179.67-.82,359.39-.45,539.05<Thinking>
I need to continue the SVG path definition that was cut off. This appears to be part of the SVG layout for the promotional image. I'll continue the path definition and then complete the rest of the component code.
</Thinking>

c-161.07,0-322.42.96-483.35-1.15-41.39-6.33-73.19-42.8-75.7-84.3-2.24-37.12,1.68-76.58.15-113.94,1.58-10.73,9.09-19.06,19.84-21.16,179.67-.82,359.39-.45,539.05-.45Z"
                />
                <path
                  className="cls-2"
                  d="M1080,0v95h-28c-96.06,0-192.17.22-288.24-.26-12.1-2.28-20.78-11.87-21.8-24.2-1.12-13.65,0-30.52.04-44.54.03-8.65-.02-17.35,0-26h338Z"
                />
                <path
                  className="cls-3"
                  d="M742,26c-.05,14.02-1.16,30.89-.04,44.54,1.01,12.33,9.7,21.92,21.8,24.2,96.07.48,192.18.26,288.24.26v242c-179.67,0-359.39-.37-539.05.45-10.75,2.1-18.26,10.43-19.84,21.16,1.53,37.36-2.39,76.82-.15,113.94,2.5,41.5,34.31,77.97,75.7,84.3,160.93,2.11,322.28,1.15,483.35,1.15l.04,327.54c-3.79,59.92-43.29,113.82-100.04,133.46,0,0-279.18-34.27-409-34-31.79.07-63.61-.12-95.41.09-7.64,1.3-11.7,6.09-14.59,12.91-.17-39.65.12-79.35,0-119,51.15.62,102.37-.49,153.54.04,38.98-4.79,43.56-38.54,40.51-71.59-.45-4.86-2.26-7.03-6.3-9.7-62.33-.78-125.27-1.57-187.74-.76l-.04-628.54c.39-9.11,3.41-18.58,4.04-27.46,6.84-24.24,18.6-47.28,35.48-66.02,2.86-3.17,7.48-8.28,10.52-10.98,24.14-21.51,60.13-36.18,92.46-38.04l166.54.04ZM513.99,576.01c-.51-.34-2.28.05-3.01.47-4.06,2.3-.51,10.29-2.48,13.53-1.5,2.47-13.4,8.17-14.46,10.54-.56,1.27-.6,2.64,1.41,2.43,4.18-.45,9.34-2.96,13.54-3.96,1.74,5.97-3.19,7.92-2.98,13l4.48-2.05c.3.02,1.18,5.25,3.02,0l4.48,2.05c.21-5.08-4.72-7.03-2.98-13,2.12.64,14.27,4.71,14.99,4s-.23-2.51-1.04-3.45c-2.16-2.52-12.4-7.79-13.46-9.54-1.42-2.35.34-12.76-1.51-14ZM518.35,635.12c0-4.04-3.27-7.31-7.31-7.31s-7.31,3.27-7.31,7.31,3.27,7.31,7.31,7.31,7.31-3.27,7.31-7.31ZM500.5,660c3.5.94,16.25,0,21,0,4.15,0,1.64-8.55-.04-10.96-4.93-7.06-16.82-6.75-21.31.61-1.59,2.61-3.71,9.26.35,10.35ZM527.99,701.01c-14.38,5.14-27.78-8.69-23-23-17.9,10.22-6.79,36.24,13.08,31.57,2.03-.48,11.86-6.64,9.92-8.57ZM525,728.01c-9.09-.08-7.93,13.8-13.53,15.97-1.65.64-3.22-4.39-4.99-5.01,2.56-12.06-19.79-14.15-12.53-1.41,3.45,6.06,10.54,2.79,14.03,8.95-1.36,2.31-13.24,10.49-9.01,13.03,3.91,2.35,3.91-.94,5.48-2.54,2.64-2.7,5.44-5.26,8.06-7.98,1.59,3.97,7.68,14.61,12.49,9.47,1.01-3.83-8.25-8.1-9.93-11.11,1.31-5.22,5.81-4.47,8.9-5.9,1.49-.69,7.44-6.94,6.03-8.46l-3.99.99.99-3.99c-1.44-.31-.82,1.17-1.73,1.98-.78.69-4.57,3.66-5.26,3.01l5-6.99Z"
                />
                <path
                  className="cls-2"
                  d="M433,797c62.48-.81,125.42-.02,187.74.76,4.04,2.66,5.86,4.84,6.3,9.7,3.05,33.05-1.53,66.8-40.51,71.59-51.17-.53-102.39.58-153.54-.04-14.14-.17-33.32,4.06-35.04-15.46-.81-9.17-1.37-47.17.51-54.57,3.9-15.32,22.64-11.81,34.53-11.97Z"
                />
                <path
                  className="cls-2"
                  d="M483,64c-3.04,2.7-7.66,7.81-10.52,10.98-16.89,18.73-28.64,41.78-35.48,66.02,1.79-24.91-1.33-51.88,0-77h46Z"
                />
                <path
                  className="cls-2"
                  d="M525,728.01l-5,6.99c.68.65,4.48-2.32,5.26-3.01.91-.81.29-2.29,1.73-1.98l-.99,3.99,3.99-.99c1.42,1.53-4.54,7.78-6.03,8.46-3.09,1.43-7.59.67-8.9,5.9,1.68,3.01,10.93,7.28,9.93,11.11-4.81,5.14-10.9-5.49-12.49-9.47-2.62,2.72-5.42,5.28-8.06,7.98-1.57,1.61-1.57,4.89-5.48,2.54-4.23-2.54,7.66-10.72,9.01-13.03-3.49-6.16-10.58-2.89-14.03-8.95-7.26-12.74,15.09-10.65,12.53,1.41,1.77.62,3.34,5.65,4.99,5.01,5.6-2.17,4.44-16.05,13.53-15.97ZM526,735.01c-1.47-.33-2.09.42-2.98,1.5l2.98-.52v-.98Z"
                />
                <path
                  className="cls-2"
                  d="M513.99,576.01c1.85,1.23.09,11.64,1.51,14,1.06,1.75,11.29,7.02,13.46,9.54.81.95,1.75,2.73,1.04,3.45s-12.87-3.35-14.99-4c-1.74,5.97,3.19,7.92,2.98,13l-4.48-2.05c-1.85,5.25-2.72.02-3.02,0l-4.48,2.05c-.21-5.08,4.72-7.03,2.98-13-4.21,1-9.36,3.51-13.54,3.96-2.01.22-1.97-1.16-1.41-2.43,1.06-2.37,12.96-8.08,14.46-10.54,1.97-3.24-1.58-11.22,2.48-13.53.74-.42,2.5-.81,3.01-.47Z"
                />
                <path
                  className="cls-2"
                  d="M527.99,701.01c1.94,1.93-7.89,8.09-9.92,8.57-19.87,4.68-30.98-21.34-13.08-31.57-4.78,14.31,8.62,28.14,23,23Z"
                />
                <path
                  className="cls-2"
                  d="M500.5,660c-4.06-1.09-1.95-7.74-.35-10.35,4.49-7.36,16.38-7.67,21.31-.61,1.68,2.41,4.19,10.96.04,10.96-4.75,0-17.5.94-21,0Z"
                />
                <circle className="cls-2" cx="511.04" cy="635.12" r="7.31" />
                <path className="cls-3" d="M526,735.01v.98l-2.98.52c.89-1.08,1.51-1.83,2.98-1.5Z" />
              </g>
              <path
                className="cls-1"
                d="M952,1003.81v51.27c0,16.53-13.4,29.93-29.93,29.93h-398.07c-16.53,0,18.99-13.4,18.99-29.93v-40.15c0-16.53-29.32-29.93-12.79-29.93h383.04c6.59,0,16.96.22,23.71,0,10.86-.33,15.04,7.93,15.04,18.8h0Z"
              />
              <g>
                <path
                  className="cls-2"
                  d="M543,985v100h-84.5c-8.73,0-21.45-12.92-24-21-4.09-12.95-1.44-50.21-1.5-66,2.88-6.82,6.94-11.62,14.59-12.91,31.8-.21,63.62-.02,95.41-.09ZM457,1067c1.66,1.61,13.82-3.7,16.69-3.72,2.11-.02,7.17,3.17,10.91,3.62,35.53,4.3,53.63-38,25.87-59.87-24.06-18.95-57.38,2.26-53.4,32.4.48,3.65,3.7,8.42,3.89,11.13.2,2.96-4.95,15.49-3.96,16.44Z"
                />
                <path
                  className="cls-3"
                  d="M457,1067c-.98-.95,4.17-13.48,3.96-16.44-.19-2.71-3.4-7.48-3.89-11.13-3.98-30.14,29.34-51.35,53.4-32.4,27.76,21.87,9.66,64.17-25.87,59.87-3.74-.45-8.8-3.64-10.91-3.62-2.87.02-15.03,5.33-16.69,3.72ZM465.01,1060c2.57-.88,6.95-2.94,9.53-2.88,1.99.04,5.76,2.71,8.42,3.43,23.15,6.3,42.81-17.78,32.23-39.23-13.43-27.2-56.73-16.5-52.1,18.1.51,3.81,3.62,7.32,3.91,10.17.34,3.45-2.11,6.94-1.98,10.41Z"
                />
                <path
                  className="cls-2"
                  d="M465.01,1060c-.13-3.47,2.33-6.97,1.98-10.41-.28-2.85-3.4-6.36-3.91-10.17-4.63-34.6,38.67-45.3,52.1-18.1,10.58,21.44-9.08,45.53-32.23,39.23-2.65-.72-6.43-3.38-8.42-3.43-2.58-.06-6.96,2-9.53,2.88ZM506.85,1041.14c-.23-.33-6.84-3.14-7.37-3.13-3.94.08-2.33,6.59-9.81,1.81-1.35-.86-7.28-6.43-7.56-7.52-.72-2.8,2.83-3.44,2.71-5.6-.28-5.44-5.79-13.01-10.23-5.62-6.32,10.51,11.56,26.44,21.36,28.48,5.74,1.19,14.42-3.46,10.9-8.42Z"
                />
                <path
                  className="cls-3"
                  d="M506.85,1041.14c3.51,4.96-5.16,9.61-10.9,8.42-9.8-2.04-27.68-17.96-21.36-28.48,4.44-7.39,9.95.18,10.23,5.62.11,2.16-3.44,2.81-2.71,5.6.28,1.09,6.21,6.66,7.56,7.52,7.48,4.78,5.87-1.73,9.81-1.81.53-.01,7.14,2.8,7.37,3.13Z"
                />
              </g>
            </svg>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col z-10">
              {/* Region Tag */}
              <div className="absolute top-0 right-0 bg-[#f5a406] text-[#002043] font-bold text-[60px] py-6 px-10 rounded-bl-[30px]">
                {getRegion(promo.DESTINO)}
              </div>

              {/* Main Content */}
              <div className="pt-[250px] px-[80px]">
                {/* Destination */}
                <h1 className="text-[#f5a406] font-bold text-[120px] leading-tight">{promo.DESTINO}</h1>

                {/* Hotel */}
                <h2 className="text-white font-medium text-[80px] mb-4">{promo.HOTEL}</h2>

                {/* Date */}
                <p className="text-[#f5a406] font-medium text-[60px] mb-8">{formatDateRange()}</p>

                {/* Price */}
                <div className="bg-[#f5a406] text-[#002043] rounded-[50px] p-8 mb-12">
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
                    <div className="text-[#f5a406] mr-6">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.5 15.5C22.3284 15.5 23 14.8284 23 14C23 13.1716 22.3284 12.5 21.5 12.5L3.5 12.5C2.67157 12.5 2 13.1716 2 14C2 14.8284 2.67157 15.5 3.5 15.5L21.5 15.5Z" />
                        <path d="M21.5 8.5C22.3284 8.5 23 7.82843 23 7C23 6.17157 22.3284 5.5 21.5 5.5L8.5 5.5C7.67157 5.5 7 6.17157 7 7C7 7.82843 7.67157 8.5 8.5 8.5L21.5 8.5Z" />
                        <path d="M21.5 22.5C22.3284 22.5 23 21.8284 23 21C23 20.1716 22.3284 19.5 21.5 19.5L13.5 19.5C12.6716 19.5 12 20.1716 12 21C12 21.8284 12.6716 22.5 13.5 22.5L21.5 22.5Z" />
                        <path d="M2 7C2 6.17157 2.67157 5.5 3.5 5.5C4.32843 5.5 5 6.17157 5 7L5 21C5 21.8284 4.32843 22.5 3.5 22.5C2.67157 22.5 2 21.8284 2 21L2 7Z" />
                      </svg>
                    </div>
                    Aéreo Ida e Volta
                  </div>
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-[#f5a406] mr-6">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" />
                      </svg>
                    </div>
                    Valor por pessoa
                  </div>
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-[#f5a406] mr-6">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.5 14.0784C20.3003 14.7189 18.9341 15.0821 17.5 15.0821C12.8056 15.0821 9 11.2766 9 6.58214C9 5.14806 9.36323 3.78178 10.0037 2.58215C6.17668 3.70811 3.5 7.28562 3.5 11.5C3.5 16.7467 7.75329 21 13 21C17.2144 21 20.7919 18.3233 21.9179 14.4963C21.7806 14.3594 21.6438 14.2211 21.5 14.0784Z" />
                      </svg>
                    </div>
                    {promo.NUMERO_DE_NOITES} Noites
                  </div>
                  <div className="flex items-center text-white text-[50px]">
                    <div className="text-[#f5a406] mr-6">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.5 2C8.5 2 8.5 6 8.5 8C8.5 10 7 11 7 11H2C2 11 3.5 10 3.5 8C3.5 6 3.5 2 3.5 2H8.5Z" />
                        <path d="M19.5 2C19.5 2 19.5 6 19.5 8C19.5 10 18 11 18 11H13C13 11 14.5 10 14.5 8C14.5 6 14.5 2 14.5 2H19.5Z" />
                        <path d="M21 22H3C3 22 2 16 2 13H22C22 16 21 22 21 22Z" />
                      </svg>
                    </div>
                    {getRegimeAlimentacao()}
                  </div>
                </div>

                {/* Departure */}
                <div className="bg-[#f5a406] text-[#002043] rounded-[30px] p-6 inline-block text-[40px] font-bold">
                  saindo de
                  <br />
                  {getDepartureAirport()}
                </div>
              </div>

              {/* Fine print */}
              <div className="absolute bottom-[300px] left-0 right-0 text-center text-white text-[30px] px-[80px]">
                Preço por pessoa em apartamento duplo, sujeito a alteração sem aviso prévio, taxas inclusas.
              </div>

              {/* Contact section */}
              <div className="absolute bottom-[200px] left-0 right-0">
                <div className="flex items-center bg-[#f5a406] text-[#002043] p-6 max-w-[600px]">
                  <div className="bg-[#f5a406] p-2 rounded-full mr-6">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.5 1.5C8.39543 1.5 7.5 2.39543 7.5 3.5V20.5C7.5 21.6046 8.39543 22.5 9.5 22.5H14.5C15.6046 22.5 16.5 21.6046 16.5 20.5V3.5C16.5 2.39543 15.6046 1.5 14.5 1.5H9.5ZM12 18.5C11.1716 18.5 10.5 19.1716 10.5 20C10.5 20.8284 11.1716 21.5 12 21.5C12.8284 21.5 13.5 20.8284 13.5 20C13.5 19.1716 12.8284 18.5 12 18.5Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[40px] font-bold">Contato e Whatsapp</div>
                    <div className="text-[50px] font-bold">(67) 9637-2769</div>
                  </div>
                </div>
              </div>

              {/* Footer with logo */}
              <div className="absolute bottom-0 left-0 right-0">
                <div className="text-white text-[100px] font-bold ml-[80px] mb-[50px]">
                  D<span className="text-[#f5a406]">o</span>natti
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

