"use client"
import { useState, useEffect } from "react"
import type React from "react"
import {
  Loader2,
  Save,
  X,
  User,
  Mail,
  Lock,
  UserCog,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  Briefcase,
} from "lucide-react"

interface EmployeeFormProps {
  employee?: any
  onSuccess: () => void
  onCancel: () => void
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "agent",
    salary: "",
    admissionDate: "",
    department: "",
    position: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    birthDate: "",
    documentId: "",
    bankInfo: {
      bank: "",
      accountType: "",
      accountNumber: "",
      agency: "",
    },
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with employee data if editing
  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id || "",
        name: employee.name || "",
        email: employee.email || "",
        password: "", // Don't populate password for security
        role: employee.role || "agent",
        salary: employee.salary ? employee.salary.toString() : "",
        admissionDate: employee.admissionDate ? new Date(employee.admissionDate).toISOString().split("T")[0] : "",
        department: employee.department || "",
        position: employee.position || "",
        phoneNumber: employee.phoneNumber || "",
        address: employee.address || "",
        emergencyContact: employee.emergencyContact || "",
        birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split("T")[0] : "",
        documentId: employee.documentId || "",
        bankInfo: {
          bank: employee.bankInfo?.bank || "",
          accountType: employee.bankInfo?.accountType || "",
          accountNumber: employee.bankInfo?.accountNumber || "",
          agency: employee.bankInfo?.agency || "",
        },
      })
    }
  }, [employee])

  const handleChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
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
    const requiredFields = ["name", "email", "role"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    // Also require password for new employees
    if (!employee && !formData.password) {
      missingFields.push("password")
    }

    if (missingFields.length > 0) {
      setFormError(`Campos obrigatórios não preenchidos: ${missingFields.join(", ")}`)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError("Por favor, insira um email válido.")
      return
    }

    // Validate password length if provided
    if (formData.password && formData.password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    try {
      setIsLoading(true)

      // Prepare data for API
      const employeeData = {
        ...formData,
        salary: formData.salary ? Number.parseFloat(formData.salary) : undefined,
      }

      // If editing and password is empty, remove it from the request
      if (employee && !employeeData.password) {
        delete employeeData.password
      }

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar funcionário")
      }

      setFormSuccess(formData.id ? "Funcionário atualizado com sucesso!" : "Funcionário adicionado com sucesso!")

      // Notify parent component
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      console.error("Error saving employee:", error)
      setFormError(error instanceof Error ? error.message : "Erro ao salvar funcionário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-primary-blue mb-6 font-mon">
        {employee ? "Editar Funcionário" : "Adicionar Novo Funcionário"}
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
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Mail className="h-4 w-4" />
              Email <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Lock className="h-4 w-4" />
              Senha {!employee && <span className="text-red-500">*</span>}
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={employee ? "Deixe em branco para manter a senha atual" : "Mínimo de 6 caracteres"}
              required={!employee}
            />
            {employee && <p className="text-xs text-gray-500 font-mon">Deixe em branco para manter a senha atual</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <UserCog className="h-4 w-4" />
              Função <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              id="role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
            >
              <option value="admin">Administrador</option>
              <option value="agent">Agente de Turismo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Building className="h-4 w-4" />
              Departamento
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder="Ex: Vendas"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Briefcase className="h-4 w-4" />
              Cargo
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="Ex: Agente de Viagens"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Calendar className="h-4 w-4" />
              Data de Admissão
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="date"
              id="admissionDate"
              value={formData.admissionDate}
              onChange={(e) => handleChange("admissionDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <CreditCard className="h-4 w-4" />
              Salário
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="number"
              id="salary"
              value={formData.salary}
              onChange={(e) => handleChange("salary", e.target.value)}
              placeholder="Ex: 3500"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Phone className="h-4 w-4" />
              Telefone
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="Ex: (67) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <MapPin className="h-4 w-4" />
              Endereço
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Ex: Rua Exemplo, 123"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Phone className="h-4 w-4" />
              Contato de Emergência
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              placeholder="Nome e telefone"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Calendar className="h-4 w-4" />
              Data de Nascimento
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="date"
              id="birthDate"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-primary-blue mb-4 mt-8 font-mon">Informações Bancárias</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Building className="h-4 w-4" />
              Banco
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="bankInfo.bank"
              value={formData.bankInfo.bank}
              onChange={(e) => handleChange("bankInfo.bank", e.target.value)}
              placeholder="Ex: Banco do Brasil"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <CreditCard className="h-4 w-4" />
              Tipo de Conta
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              id="bankInfo.accountType"
              value={formData.bankInfo.accountType}
              onChange={(e) => handleChange("bankInfo.accountType", e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Conta Poupança</option>
              <option value="salario">Conta Salário</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <CreditCard className="h-4 w-4" />
              Número da Conta
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="bankInfo.accountNumber"
              value={formData.bankInfo.accountNumber}
              onChange={(e) => handleChange("bankInfo.accountNumber", e.target.value)}
              placeholder="Ex: 12345-6"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-blue font-mon font-medium">
              <Building className="h-4 w-4" />
              Agência
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-gray-800 font-mon"
              type="text"
              id="bankInfo.agency"
              value={formData.bankInfo.agency}
              onChange={(e) => handleChange("bankInfo.agency", e.target.value)}
              placeholder="Ex: 1234"
            />
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
                {employee ? "Atualizar" : "Adicionar"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

