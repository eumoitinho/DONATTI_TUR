"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, UserCog, Award, DollarSign, Calendar, Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { EmployeeForm } from "./EmployeeForm"
import { PerformanceReviewForm } from "./PerformanceReviewForm"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  salary?: number
  admissionDate?: string
  department?: string
  position?: string
  performanceHistory?: {
    date: string
    type: string
    description: string
    value?: number
  }[]
}

interface PerformanceReview {
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
}

export function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState("employees")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddReview, setShowAddReview] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchPerformanceReviews()
  }, [])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) throw new Error("Failed to fetch employees")
      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError("Erro ao buscar funcionários")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPerformanceReviews = async () => {
    try {
      const response = await fetch("/api/employees/performance")
      if (!response.ok) throw new Error("Failed to fetch performance reviews")
      const data = await response.json()
      setPerformanceReviews(data)
    } catch (err) {
      console.error("Error fetching performance reviews:", err)
    }
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  const handleAddEmployeeClick = () => {
    setSelectedEmployee(null)
    setShowAddEmployee(true)
  }

  const handleAddReviewClick = () => {
    setShowAddReview(true)
  }

  const handleFormSuccess = () => {
    fetchEmployees()
    fetchPerformanceReviews()
    setShowAddEmployee(false)
    setShowAddReview(false)
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="employees"
            className="font-mon data-[state=active]:bg-white data-[state=active]:text-primary-blue"
          >
            <UserCog className="h-4 w-4 mr-2" />
            <span>Funcionários</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="font-mon data-[state=active]:bg-white data-[state=active]:text-primary-blue"
          >
            <Award className="h-4 w-4 mr-2" />
            <span>Avaliações de Desempenho</span>
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="font-mon data-[state=active]:bg-white data-[state=active]:text-primary-blue"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Salários e Benefícios</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="font-mon data-[state=active]:bg-white data-[state=active]:text-primary-blue"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          {showAddEmployee ? (
            <EmployeeForm
              employee={selectedEmployee}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddEmployee(false)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar funcionários..."
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleAddEmployeeClick}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-second-blue transition-colors font-mon"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Funcionário</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
                  <span className="ml-2 text-gray-600 font-mon">Carregando funcionários...</span>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mon">
                  Nenhum funcionário encontrado com os filtros atuais.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nome
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Cargo
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Departamento
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Data de Admissão
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Salário
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-blue text-white rounded-full flex items-center justify-center">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.position || "Não definido"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.department || "Não definido"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {employee.admissionDate
                                ? format(new Date(employee.admissionDate), "dd/MM/yyyy", { locale: ptBR })
                                : "Não definido"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {employee.salary
                                ? employee.salary.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "Não definido"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleEmployeeSelect(employee)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleAddReviewClick()}
                              className="text-green-600 hover:text-green-800"
                            >
                              Avaliar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          {showAddReview ? (
            <PerformanceReviewForm
              employees={employees}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddReview(false)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary-blue">Avaliações de Desempenho</h3>
                <button
                  onClick={handleAddReviewClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-second-blue transition-colors font-mon"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Avaliação</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
                  <span className="ml-2 text-gray-600 font-mon">Carregando avaliações...</span>
                </div>
              ) : performanceReviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mon">
                  Nenhuma avaliação de desempenho encontrada.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Funcionário
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Período
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Avaliação
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Métricas
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Data
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performanceReviews.map((review) => {
                        const employee = employees.find((e) => e.id === review.userId)
                        return (
                          <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {employee?.name || "Funcionário não encontrado"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{review.period}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    review.rating >= 8
                                      ? "bg-green-100 text-green-800"
                                      : review.rating >= 6
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {review.rating}/10
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">Promos:</span> {review.metrics.promosSent} enviadas,{" "}
                                {review.metrics.promosConverted} convertidas
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-blue-600 hover:text-blue-800 mr-3">Ver Detalhes</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="salary">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Salários e Benefícios</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary-blue mb-3">Resumo de Folha de Pagamento</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de funcionários:</span>
                    <span className="font-medium">{employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Folha mensal:</span>
                    <span className="font-medium">
                      {employees
                        .reduce((sum, emp) => sum + (emp.salary || 0), 0)
                        .toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Média salarial:</span>
                    <span className="font-medium">
                      {employees.length > 0
                        ? (
                            employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary-blue mb-3">Benefícios</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vale Refeição:</span>
                    <span className="font-medium">R$ 30,00/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vale Transporte:</span>
                    <span className="font-medium">R$ 220,00/mês</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plano de Saúde:</span>
                    <span className="font-medium">Unimed (Coparticipação)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-primary-blue mb-3">Próximos Pagamentos</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Data
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tipo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Valor Total
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">05/04/2025</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Salário</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employees
                          .reduce((sum, emp) => sum + (emp.salary || 0), 0)
                          .toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20/03/2025</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Adiantamento</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) * 0.4).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Pago
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Histórico de Funcionários</h3>

            <div className="space-y-8">
              {employees.map((employee) => (
                <div key={employee.id} className="border-b pb-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-primary-blue text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-primary-blue">{employee.name}</h4>
                      <p className="text-gray-600">
                        {employee.position || "Cargo não definido"} •{" "}
                        {employee.department || "Departamento não definido"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-2 relative border-l-2 border-gray-200 pl-8 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary-blue"></div>
                      <div>
                        <h5 className="font-medium text-gray-900">Admissão</h5>
                        <p className="text-sm text-gray-600">
                          {employee.admissionDate
                            ? format(new Date(employee.admissionDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : "Data não definida"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Contratado como {employee.position || "Cargo não definido"} com salário inicial de{" "}
                          {employee.salary
                            ? employee.salary.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "não definido"}
                        </p>
                      </div>
                    </div>

                    {employee.performanceHistory && employee.performanceHistory.length > 0 ? (
                      employee.performanceHistory.map((event, index) => (
                        <div key={index} className="relative">
                          <div
                            className={`absolute -left-10 mt-1.5 h-4 w-4 rounded-full ${
                              event.type === "promotion"
                                ? "bg-green-500"
                                : event.type === "review"
                                  ? "bg-blue-500"
                                  : event.type === "warning"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                            }`}
                          ></div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {event.type === "promotion"
                                ? "Promoção"
                                : event.type === "review"
                                  ? "Avaliação de Desempenho"
                                  : event.type === "warning"
                                    ? "Advertência"
                                    : "Bônus"}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            {event.value && (
                              <p className="text-sm font-medium mt-1">
                                {event.type === "review"
                                  ? `Nota: ${event.value}/10`
                                  : `Valor: ${event.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">Nenhum evento registrado no histórico</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

