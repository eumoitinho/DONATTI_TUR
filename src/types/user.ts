export interface User {
  id: string
  email: string
  name: string
  password: string
  role: "admin" | "agent" // Define os papéis possíveis
  createdAt: string
  updatedAt?: string
  lastLogin?: string
  active: boolean
  // Campos adicionais para gerenciamento de funcionários
  salary?: number
  admissionDate?: string
  department?: string
  position?: string
  phoneNumber?: string
  address?: string
  emergencyContact?: string
  birthDate?: string
  documentId?: string
  bankInfo?: {
    bank?: string
    accountType?: string
    accountNumber?: string
    agency?: string
  }
  performanceHistory?: {
    date: string
    type: "review" | "promotion" | "warning" | "bonus"
    description: string
    value?: number
  }[]
}

export interface UserStats {
  id: string
  name: string
  email: string
  role: string
  totalPromos: number
  lastPromoDate?: string
  lastLoginDate?: string
  // Estatísticas adicionais
  conversionRate?: number
  averageValue?: number
  performanceRating?: number
  monthlySales?: {
    month: string
    count: number
    value: number
  }[]
}

export interface EmployeePerformance {
  userId: string
  period: string
  metrics: {
    promosSent: number
    promosConverted: number
    totalValue: number
    customerSatisfaction: number
    responseTime: number
  }
  notes: string
  rating: number
}

