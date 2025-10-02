import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Vaga, Report } from '../types/database'
import { getReportsByUser } from '../lib/reports'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react'

export default function ReportsList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadReports = async () => {
      try {
        setLoading(true)
        const reportsData = await getReportsByUser(user.id, user.role)
        setReports(reportsData)
      } catch (error) {
        console.error('Erro ao carregar reports:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [user])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status === 'pending' ? 'Pendente' : 
         status === 'in_progress' ? 'Em Andamento' :
         status === 'completed' ? 'Concluído' : 'Rejeitado'}
      </Badge>
    )
  }

  const getFieldLabel = (fieldName: string) => {
    const labels: { [key: string]: string } = {
      site: 'Site',
      categoria: 'Categoria',
      cargo: 'Cargo',
      cliente: 'Cliente',
      titulo: 'Título',
      descricao_vaga: 'Descrição da vaga',
      responsabilidades_atribuicoes: 'Responsabilidades e atribuições',
      requisitos_qualificacoes: 'Requisitos e qualificações',
      salario: 'Salário',
      horario_trabalho: 'Horário de Trabalho',
      jornada_trabalho: 'Jornada de Trabalho',
      beneficios: 'Benefícios',
      local_trabalho: 'Local de Trabalho',
      etapas_processo: 'Etapas do processo'
    }
    return labels[fieldName] || fieldName
  }

  const handleViewReport = (report: Report) => {
    if (user?.role === 'ADMIN' && report.status === 'pending') {
      navigate(`/dashboard/editar-report/${report.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-lg text-gray-700">Carregando reports...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Reports de Oportunidades
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'ADMIN' 
              ? 'Gerencie todos os reports de oportunidades' 
              : 'Visualize seus reports enviados'
            }
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reports.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Reports */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum report encontrado
            </h3>
            <p className="text-gray-500">
              {user?.role === 'ADMIN' 
                ? 'Não há reports pendentes no momento.' 
                : 'Você ainda não enviou nenhum report.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      {report.vaga?.titulo || report.vaga?.cargo} - {report.vaga?.cliente}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Campo reportado: <span className="font-semibold">{getFieldLabel(report.field_name)}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    {user?.role === 'ADMIN' && report.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleViewReport(report)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Valor Atual:</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      {report.current_value || 'Não informado'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Sugestões:</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm">
                      {report.suggested_changes}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Reportado por: {report.reporter?.name}</span>
                    </div>
                    {user?.role === 'ADMIN' && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Atribuído para: {report.assignee?.name}</span>
                      </div>
                    )}
                  </div>
                  <span>
                    {new Date(report.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(report.created_at).toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                {report.admin_notes && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Notas do Admin:
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {report.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
