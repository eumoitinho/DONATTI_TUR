"use client"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

import type React from "react"
import { Loader2, Save, X, Award, User, BarChart2, MessageSquare } from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
}

interface PerformanceReviewFormProps {
  employees: Employee[]
  onSuccess: () => void
  onCancel: () => void
}

export function PerformanceReviewForm({ employees, onSuccess, onCancel }: PerformanceReviewFormProps) {
  const [formData, setFormData] = useState({
    userId: "",
    period: "",
    metrics: {
      promosSent: 0,
      promosConverted: 0,
      totalValue: 0,
      customerSatisfaction: 0,
      responseTime: 0,
    },
    notes: "",
    rating: 0,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: string | number) => {
    if (field.startsWith("metrics.")) {
      const metricField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricField]: typeof value === "string" ? Number.parseFloat(value) : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    // Validate required fields
    if (!formData.userId) {
      setFormError("Por favor, selecione um funcionário.")
      return
    }

    if (!formData.period) {
      setFormError("Por favor, informe o período da avaliação.")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/employees/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar avaliação de desempenho")
      }

      setFormSuccess("Avaliação de desempenho registrada com sucesso!")

      // Notify parent component
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      console.error("Error saving performance review:", error)
      setFormError(error instanceof Error ? error.message : "Erro ao salvar avaliação de desempenho")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-primary-blue mb-6 font-mon flex items-center">
        <Award className="h-5 w-5 mr-2" />
        Nova Avaliação de Desempenho
      </h2>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-mon">
          <p>{formError}</p>
        </div>
      )}

      {formSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 font-mon">
          <p>{formSuccess}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <User className="h-4 w-4" />
              Funcionário <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              id="userId"
              value={formData.userId}
              onChange={(e) => handleChange("userId", e.target.value)}
              required
            >
              <option value="">Selecione um funcionário</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Calendar className="h-4 w-4" />
              Período <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="period"
              value={formData.period}
              onChange={(e) => handleChange("period", e.target.value)}
              placeholder="Ex: Janeiro 2025"
              required
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-primary-blue mb-4 mt-8 font-mon flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Métricas de Desempenho
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">Promoções Enviadas</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="number"
              id="metrics.promosSent"
              value={formData.metrics.promosSent}
              onChange={(e) => handleChange("metrics.promosSent", e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              Promoções Convertidas
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="number"
              id="metrics.promosConverted"
              value={formData.metrics.promosConverted}
              onChange={(e) => handleChange("metrics.promosConverted", e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">Valor Total (R$)</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="number"
              id="metrics.totalValue"
              value={formData.metrics.totalValue}
              onChange={(e) => handleChange("metrics.totalValue", e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              Satisfação do Cliente (0-10)
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="number"
              id="metrics.customerSatisfaction"
              value={formData.metrics.customerSatisfaction}
              onChange={(e) => handleChange("metrics.customerSatisfaction", e.target.value)}
              min="0"
              max="10"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              Tempo de Resposta (horas)
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="number"
              id="metrics.responseTime"
              value={formData.metrics.responseTime}
              onChange={(e) => handleChange("metrics.responseTime", e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
            <MessageSquare className="h-4 w-4" />
            Observações
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon min-h-[100px]"
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Observações sobre o desempenho do funcionário..."
          />
        </div>

        <div className="space-y-2 mb-8">
          <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
            <Award className="h-4 w-4" />
            Avaliação Geral (0-10) <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
            type="number"
            id="rating"
            value={formData.rating}
            onChange={(e) => handleChange("rating", Number.parseFloat(e.target.value))}
            min="0"
            max="10"
            step="0.1"
            required
          />
          <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
            <span>0 - Insatisfatório</span>
            <span>5 - Regular</span>
            <span>10 - Excelente</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-mon font-medium flex items-center justify-center"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-primary-blue text-white rounded-md hover:bg-second-blue transition-colors font-mon font-medium flex items-center justify-center min-w-[160px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Registrar Avaliação
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

