"use client"
import { useState, useRef, useEffect } from "react"
import { toPng } from "html-to-image"
import { Loader2, Download } from "lucide-react"

interface PromoImageGeneratorProps {
  promo: any
}

export function PromoImageGenerator({ promo }: PromoImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [destinationImage, setDestinationImage] = useState<string | null>(null)
  const templateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDestinationImage()
  }, [promo.DESTINO])

  const fetchDestinationImage = async () => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(promo.DESTINO)}&orientation=portrait&per_page=1`,
        { headers: { Authorization: "563492ad6f91700001000001f89d893e82f44b0ba4f2c5eb6a44a8f1" } }
      )
      const data = await response.json()
      setDestinationImage(data.photos?.[0]?.src?.large2x || null)
    } catch {
      setDestinationImage(null)
    }
  }

  const generateImage = async () => {
    if (!templateRef.current) return
    setIsGenerating(true)
    try {
      const dataUrl = await toPng(templateRef.current, { quality: 0.95, width: 1080, height: 1920, pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `promo-${promo.DESTINO.toLowerCase().replace(/\s+/g, "-")}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={generateImage}
        disabled={isGenerating || !destinationImage}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Baixar imagem
      </button>

      <div className="relative w-[1080px] h-[1920px] bg-white overflow-hidden" ref={templateRef}>
        {destinationImage && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${destinationImage})` }} />
        )}

        <div className="absolute w-[1080px] h-[1660px] left-0 top-[260px] overflow-hidden">
          <div className="absolute w-[1080px] h-[1565px] left-0 top-[95px]">
            <div className="absolute w-[1080px] h-72 left-0 top-[1269.92px] bg-sky-950"></div>
            <div className="absolute w-[845px] h-48 left-[235px] top-[1324px] bg-amber-500"></div>
            <div className="absolute w-[510px] h-14 left-[506px] top-[394px] text-amber-400 text-6xl font-bold">{promo.DESTINO}</div>
            <div className="absolute w-[500px] h-11 left-[508px] top-[474px] text-white text-4xl font-medium">{promo.HOTEL}</div>
            <div className="absolute w-[500px] h-11 left-[509px] top-[535px] text-amber-500 text-4xl font-medium">{promo.DATA_FORMATADA}</div>
          </div>
          <div className="absolute w-12 h-20 left-[3.70px] top-[38.05px] bg-amber-500"></div>
          <div className="absolute w-[524px] h-12 left-[87.80px] top-[898px] text-white text-xl">Preço por pessoa em apartamento duplo, sujeito a alteração sem aviso prévio, taxas inclusas.</div>
          <div className="absolute w-[587.76px] h-56 left-[95.04px] top-[336.92px] bg-amber-500">
            <div className="absolute w-[493px] h-7 left-[35.76px] top-[143.08px] text-sky-950 text-3xl">no cartão e 15x no boleto sem juros.</div>
            <div className="absolute w-32 h-16 left-[33.76px] top-[68.08px] text-sky-950 text-6xl font-black">R$</div>
            <div className="absolute w-96 h-28 left-[135.76px] top-[24.08px] text-sky-950 text-9xl font-black">{promo.VALOR}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
