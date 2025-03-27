"use client"
import { useState } from "react"
import type React from "react"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { format } from "date-fns"

interface Employee {
  id: string
  name: string
  email: string
}

interface PerformanceReviewFormProps {
  employee: Employee | null
  onClose: () => void
}

export function PerformanceReviewForm({ employee, onClose }: PerformanceReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    userId: employee?.id || "",
    period: `${format(new Date(), "MMMM yyyy")}`,
    metrics: {
      promosSent: 0,
      promosConverted: 0,
      totalValue: 0,
      customerSatisfaction: 7,
      responseTime: 0,
    },
    notes: "",
    rating: 7,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
  
    setFormData((prev) => {
      const keys = name.split(".")
      if (keys.length === 1) {
        return { ...prev, [name]: value }
      }
  
      const [section, field] = keys
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: field === "notes" ? value : Number(value),
        },
      }
    })
  }
  
  const handleSliderChange = (name: string, value: number) => {
    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // This would be a real API call in production
      // const response = await fetch('/api/employees/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // if (!response.ok) throw new Error('Failed to save performance review')

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onClose()
    } catch (error) {
      console.error("Error saving performance review:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center mb-6">
        <button type="button" className="mr-2 p-1 rounded-full hover:bg-gray-100" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-primary-blue font-mon">Avaliação de Desempenho</h2>
          <p className="text-gray-500 text-sm">
            {employee
              ? `Avaliando desempenho de ${employee.name}`
              : "Preencha os dados para adicionar uma nova avaliação"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Período de Avaliação</label>
          <input
            type="text"
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary-blue">Métricas de Desempenho</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Promoções Enviadas</label>
            <input
              type="number"
              name="metrics.promosSent"
              value={formData.metrics.promosSent.toString()}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Promoções Convertidas</label>
            <input
              type="number"
              name="metrics.promosConverted"
              value={formData.metrics.promosConverted.toString()}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Valor Total Gerado (R$)</label>
            <input
              type="number"
              name="metrics.totalValue"
              value={formData.metrics.totalValue.toString()}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Satisfação do Cliente (0-10)</label>
              <span className="text-sm font-medium">{formData.metrics.customerSatisfaction}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={formData.metrics.customerSatisfaction}
              onChange={(e) => handleSliderChange("metrics.customerSatisfaction", Number.parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tempo Médio de Resposta (minutos)</label>
            <input
              type="number"
              name="metrics.responseTime"
              value={formData.metrics.responseTime.toString()}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Adicione observações sobre o desempenho do funcionário..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="block text-sm font-medium text-gray-700">Avaliação Geral (0-10)</label>
            <span className="text-sm font-medium">{formData.rating}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={formData.rating}
            onChange={(e) => handleSliderChange("rating", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-second-blue transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Avaliação
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

