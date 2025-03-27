import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import type { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
// Defina o tipo de dados da linha
export type PlanilhaData = {
  DESTINO: string
  HOTEL: string
  DATA_FORMATADA: string
  VALOR: string
  COM_CAFE: boolean
  SEM_CAFE: boolean
  MEIA_PENSAO: boolean
  PENSAO_COMPLETA: boolean
  ALL_INCLUSIVE: boolean
  NUMERO_DE_NOITES: string
  SP: boolean
  CG: boolean
  AEREO: boolean
}

const spreadsheetId = "1bleP_G4IDE-Aj1gB5O-KjGOpXaDwj556NKk672lYwr4"

// Safely parse the private key from environment variable
const getPrivateKey = () => {
  const key = process.env.GOOGLE_PRIVATE_KEY
  // Handle potential formatting issues with the private key
  return key ? key.replace(/\\n/g, "\n") : ""
}

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
  key: getPrivateKey(),
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
})

// Função para obter dados da planilha
async function getPlanilhaData(): Promise<PlanilhaData[]> {
  try {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const promos = await sheet.getRows<PlanilhaData>()

    const responseData = promos.map((promo) => ({
      DESTINO: promo.get("DESTINO") || "",
      HOTEL: promo.get("HOTEL") || "",
      DATA_FORMATADA: promo.get("DATA_FORMATADA") || "",
      VALOR: promo.get("VALOR") || "",
      COM_CAFE: Boolean(promo.get("COM_CAFE")),
      SEM_CAFE: Boolean(promo.get("SEM_CAFE")),
      MEIA_PENSAO: Boolean(promo.get("MEIA_PENSAO")),
      PENSAO_COMPLETA: Boolean(promo.get("PENSAO_COMPLETA")),
      ALL_INCLUSIVE: Boolean(promo.get("ALL_INCLUSIVE")),
      NUMERO_DE_NOITES: promo.get("NUMERO_DE_NOITES") || "",
      SP: Boolean(promo.get("SP")),
      CG: Boolean(promo.get("CG")),
      AEREO: Boolean(promo.get("AEREO")),
    }))

    return responseData
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error)
    return []
  }
}

export async function GET(req: Request | NextRequest, res: Response | NextResponse) {
  try {
    const responseData = await getPlanilhaData()
    return Response.json(responseData)
  } catch (error) {
    console.error("Erro ao obter dados da planilha:", error)
    return Response.json({ error: "Erro ao obter dados da planilha.." }, { status: 500 })
  }
}

