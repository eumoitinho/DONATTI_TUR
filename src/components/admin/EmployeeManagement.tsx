"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Plus, FileText, Search, Filter, ArrowUpDown, Edit } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { EmployeeForm } from "./EmployeeForm"
import { PerformanceReviewForm } from "./PerformanceReviewForm"

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
  }
  performanceHistory?: {
    date: string
    type: "promotion" | "salary" | "review" | "award" | "warning"
    description: string
    value?: number
  }[]
}

export function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState("employees")
  const [employees, setEmployees] = useState<User[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...employees]

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      result = result.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(lowerCaseSearch) ||
          employee.email?.toLowerCase().includes(lowerCaseSearch) ||
          employee.employeeDetails?.position?.toLowerCase().includes(lowerCaseSearch),
      )
    }

    // Apply department filter
    if (departmentFilter && departmentFilter !== "all") {
      result = result.filter((employee) => employee.employeeDetails?.department === departmentFilter)
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue, bValue

        // Handle nested properties
        if (sortConfig.key.includes(".")) {
          const [parent, child] = sortConfig.key.split(".")
          aValue = a[parent as keyof User]?.[child as keyof (typeof a)[keyof User]] || ""
          bValue = b[parent as keyof User]?.[child as keyof (typeof b)[keyof User]] || ""
        } else {
          aValue = a[sortConfig.key as keyof User] || ""
          bValue = b[sortConfig.key as keyof User] || ""
        }

        // Handle numeric values
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        // Handle string values
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    setFilteredEmployees(result)
  }, [employees, searchTerm, departmentFilter, sortConfig])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch employees")
      const data = await response.json()
  
      // Filter only employees (not admins)
      const employeesData = data.filter((user: User) => user.role?.toLowerCase() === "agent")
      setEmployees(employeesData)
      setFilteredEmployees(employeesData)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      const direction = prev?.key === key && prev.direction === "asc" ? "desc" : "asc"
      return { key, direction }
    })
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "-"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee)
    setShowEmployeeForm(true)
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setShowEmployeeForm(true)
  }

  const handleAddReview = (employee: User) => {
    setSelectedEmployee(employee)
    setShowReviewForm(true)
  }

  const handleFormClose = () => {
    setShowEmployeeForm(false)
    setShowReviewForm(false)
    setSelectedEmployee(null)
    fetchEmployees()
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(employees.map((emp) => emp.employeeDetails?.department).filter(Boolean)))

  return (
    <div className="space-y-6">
      {showEmployeeForm ? (
        <EmployeeForm employee={selectedEmployee} onClose={handleFormClose} />
      ) : showReviewForm ? (
        <PerformanceReviewForm employee={selectedEmployee} onClose={handleFormClose} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary-blue mb-1">Gerenciamento de Funcionários</h2>
              <p className="text-gray-600">
                Gerencie informações, salários e avaliações de desempenho dos funcionários
              </p>
            </div>

            <Button onClick={handleAddEmployee} className="bg-primary-blue hover:bg-second-blue">
              <Plus className="h-4 w-4 mr-2" />
              <span>Adicionar Funcionário</span>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="employees"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Lista de Funcionários
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Desempenho
              </TabsTrigger>
              <TabsTrigger
                value="salary"
                className="data-[state=active]:bg-white data-[state=active]:text-primary-blue"
              >
                Salários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Funcionários</CardTitle>
                  <CardDescription>Gerencie os dados dos funcionários da empresa</CardDescription>

                  <div className="flex flex-col md:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nome, email ou cargo..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os departamentos</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept as string}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
                      <span className="ml-2 text-gray-600">Carregando funcionários...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Funcionário</TableHead>
                            <TableHead
                              className="cursor-pointer"
                              onClick={() => handleSort("employeeDetails.position")}
                            >
                              <div className="flex items-center">
                                Cargo
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer"
                              onClick={() => handleSort("employeeDetails.department")}
                            >
                              <div className="flex items-center">
                                Departamento
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer"
                              onClick={() => handleSort("employeeDetails.hireDate")}
                            >
                              <div className="flex items-center">
                                Data de Admissão
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("employeeDetails.salary")}>
                              <div className="flex items-center">
                                Salário
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                              <div className="flex items-center">
                                Status
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredEmployees.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                Nenhum funcionário encontrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEmployees.map((employee) => (
                              <TableRow key={employee.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src={employee.image || undefined} />
                                      <AvatarFallback className="bg-primary-blue text-white">
                                        {employee.name?.substring(0, 2).toUpperCase() || "FN"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{employee.name}</p>
                                      <p className="text-xs text-gray-500">{employee.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{employee.employeeDetails?.position || "-"}</TableCell>
                                <TableCell>{employee.employeeDetails?.department || "-"}</TableCell>
                                <TableCell>{formatDate(employee.employeeDetails?.hireDate)}</TableCell>
                                <TableCell>{formatCurrency(employee.employeeDetails?.salary)}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      employee.status === "active"
                                        ? "default"
                                        : employee.status === "inactive"
                                          ? "destructive"
                                          : "outline"
                                    }
                                    className={
                                      employee.status === "active"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : employee.status === "inactive"
                                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    }
                                  >
                                    {employee.status === "active"
                                      ? "Ativo"
                                      : employee.status === "inactive"
                                        ? "Inativo"
                                        : "Pendente"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEditEmployee(employee)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                                      onClick={() => handleAddReview(employee)}
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span className="sr-only">Avaliação</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho dos Funcionários</CardTitle>
                  <CardDescription>Visualize e gerencie o histórico de desempenho</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Performance content would go here */}
                  <div className="text-center py-12 text-gray-500">Funcionalidade em desenvolvimento</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="salary">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Salários</CardTitle>
                  <CardDescription>Gerencie salários e histórico de reajustes</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Salary content would go here */}
                  <div className="text-center py-12 text-gray-500">Funcionalidade em desenvolvimento</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default EmployeeManagement