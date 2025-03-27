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
    bank: string
    accountType: string
    accountNumber: string
    agency: string
  }[]
}

export interface EmployeeDetails {
  position?: string
  department?: string
  hireDate?: string
  salary?: number
  manager?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  documents?: {
    type: string
    number: string
    expiryDate?: string
  }[]
  bankDetails?: {
    bank: string
    accountType: string
    accountNumber: string
    branch: string
  }
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface PerformanceHistoryItem {
  date: string
  type: "promotion" | "salary" | "review" | "award" | "warning"
  description: string
  value?: number
  notes?: string
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
  id: string
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
  createdAt: string
  updatedAt: string
  createdBy: string
}

