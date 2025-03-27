"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
  createdAt?: string
  lastLogin?: string
  status?: "active" | "inactive" | "pending"
  employeeDetails?: {
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
  performanceHistory?: {
    date: string
    type: "promotion" | "salary" | "review" | "award" | "warning"
    description: string
    value?: number
  }[]
}

interface EmployeeFormProps {
  employee: User | null
  onClose: () => void
}

export function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: employee?.id || "",
    name: employee?.name || "",
    email: employee?.email || "",
    role: employee?.role || "agent",
    status: employee?.status || "active",
    employeeDetails: {
      position: employee?.employeeDetails?.position || "",
      department: employee?.employeeDetails?.department || "",
      hireDate: employee?.employeeDetails?.hireDate || format(new Date(), "yyyy-MM-dd"),
      salary: employee?.employeeDetails?.salary || 0,
      manager: employee?.employeeDetails?.manager || "",
      emergencyContact: {
        name: employee?.employeeDetails?.emergencyContact?.name || "",
        relationship: employee?.employeeDetails?.emergencyContact?.relationship || "",
        phone: employee?.employeeDetails?.emergencyContact?.phone || "",
      },
      bankDetails: {
        bank: employee?.employeeDetails?.bankDetails?.bank || "",
        accountType: employee?.employeeDetails?.bankDetails?.accountType || "",
        accountNumber: employee?.employeeDetails?.bankDetails?.accountNumber || "",
        branch: employee?.employeeDetails?.bankDetails?.branch || "",
      },
      address: {
        street: employee?.employeeDetails?.address?.street || "",
        number: employee?.employeeDetails?.address?.number || "",
        complement: employee?.employeeDetails?.address?.complement || "",
        neighborhood: employee?.employeeDetails?.address?.neighborhood || "",
        city: employee?.employeeDetails?.address?.city || "",
        state: employee?.employeeDetails?.address?.state || "",
        zipCode: employee?.employeeDetails?.address?.zipCode || "",
        country: employee?.employeeDetails?.address?.country || "Brasil",
      },
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

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

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      employeeDetails: {
        ...prev.employeeDetails,
        [section]: {
          ...prev.employeeDetails[section as keyof typeof prev.employeeDetails],
          [field]: value,
        },
      },
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
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
      // const response = await fetch('/api/employees', {
      //   method: employee ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // if (!response.ok) throw new Error('Failed to save employee')

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onClose()
    } catch (error) {
      console.error("Error saving employee:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button type="button" variant="ghost" size="sm" className="mr-2" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>{employee ? "Editar Funcionário" : "Adicionar Funcionário"}</CardTitle>
              <CardDescription>
                {employee
                  ? `Editando informações de ${employee.name}`
                  : "Preencha os dados para adicionar um novo funcionário"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid grid-cols-4 bg-gray-100">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger
                value="employment"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Emprego
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Financeiro
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Endereço
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    name="role"
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contato de Emergência</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nome"
                    value={formData.employeeDetails.emergencyContact.name}
                    onChange={(e) => handleNestedInputChange("emergencyContact", "", "name", e.target.value)}
                  />
                  <Input
                    placeholder="Relação"
                    value={formData.employeeDetails.emergencyContact.relationship}
                    onChange={(e) => handleNestedInputChange("emergencyContact", "", "relationship", e.target.value)}
                  />
                  <Input
                    placeholder="Telefone"
                    value={formData.employeeDetails.emergencyContact.phone}
                    onChange={(e) => handleNestedInputChange("emergencyContact", "", "phone", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeDetails.position">Cargo</Label>
                  <Input
                    id="employeeDetails.position"
                    name="employeeDetails.position"
                    value={formData.employeeDetails.position}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeDetails.department">Departamento</Label>
                  <Input
                    id="employeeDetails.department"
                    name="employeeDetails.department"
                    value={formData.employeeDetails.department}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeDetails.hireDate">Data de Admissão</Label>
                  <Input
                    id="employeeDetails.hireDate"
                    name="employeeDetails.hireDate"
                    type="date"
                    value={formData.employeeDetails.hireDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeDetails.manager">Gestor</Label>
                  <Input
                    id="employeeDetails.manager"
                    name="employeeDetails.manager"
                    value={formData.employeeDetails.manager}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeDetails.salary">Salário (R$)</Label>
                <Input
                  id="employeeDetails.salary"
                  name="employeeDetails.salary"
                  type="number"
                  value={formData.employeeDetails.salary.toString()}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Dados Bancários</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Banco"
                    value={formData.employeeDetails.bankDetails.bank}
                    onChange={(e) => handleNestedInputChange("bankDetails", "", "bank", e.target.value)}
                  />
                  <Input
                    placeholder="Tipo de Conta"
                    value={formData.employeeDetails.bankDetails.accountType}
                    onChange={(e) => handleNestedInputChange("bankDetails", "", "accountType", e.target.value)}
                  />
                  <Input
                    placeholder="Número da Conta"
                    value={formData.employeeDetails.bankDetails.accountNumber}
                    onChange={(e) => handleNestedInputChange("bankDetails", "", "accountNumber", e.target.value)}
                  />
                  <Input
                    placeholder="Agência"
                    value={formData.employeeDetails.bankDetails.branch}
                    onChange={(e) => handleNestedInputChange("bankDetails", "", "branch", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rua</Label>
                  <Input
                    value={formData.employeeDetails.address.street}
                    onChange={(e) => handleNestedInputChange("address", "", "street", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={formData.employeeDetails.address.number}
                      onChange={(e) => handleNestedInputChange("address", "", "number", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      value={formData.employeeDetails.address.complement}
                      onChange={(e) => handleNestedInputChange("address", "", "complement", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    value={formData.employeeDetails.address.neighborhood}
                    onChange={(e) => handleNestedInputChange("address", "", "neighborhood", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.employeeDetails.address.city}
                    onChange={(e) => handleNestedInputChange("address", "", "city", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={formData.employeeDetails.address.state}
                    onChange={(e) => handleNestedInputChange("address", "", "state", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.employeeDetails.address.zipCode}
                    onChange={(e) => handleNestedInputChange("address", "", "zipCode", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

