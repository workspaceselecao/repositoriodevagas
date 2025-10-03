import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Vaga, Report } from '../types/database'
import { getReportsByUser, updateReportStatus } from '../lib/reports'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Eye, CheckCircle, XCircle, Clock, User, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function ReportsList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const loadReports = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      
      console.log('📝 [ReportsList] Carregando reports para usuário:', { id: user?.id, role: user?.role, name: user?.name })
      const reportsData = await getReportsByUser(user!.id, user!.role)
      console.log('📝 [ReportsList] Reports carregados:', reportsData)
      setReports(reportsData)
    } catch (error) {
      console.error('❌ [ReportsList] Erro ao carregar reports:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    console.log('🔄 [ReportsList] Forçando refresh dos reports...')
    
    // Debug: verificar dados do usuário atual
    console.log('🔍 [ReportsList] Dados do usuário para debug:', {
      id: user?.id,
      role: user?.role,
      email: user?.email,
      name: user?.name
    })
    
    await loadReports(true)
  }

  useEffect(() => {
    if (!user) return
    loadReports()
  }, [user])

  // Escutar evento de report criado para atualizar automaticamente
  useEffect(() => {
    const handleReportCreated = (event: CustomEvent) => {
      console.log('📢 Evento de report criado recebido:', event.detail)
      // Recarregar reports após um pequeno delay para garantir que foi salvo
      setTimeout(() => {
        loadReports(true)
      }, 1000)
    }

    window.addEventListener('report-created', handleReportCreated as EventListener)
    
    return () => {
      window.removeEventListener('report-created', handleReportCreated as EventListener)
    }
  }, [user])

  // Função para aceitar report
  const handleAcceptReport = async (report: Report) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Apenas administradores podem aceitar reports')
      return
    }

    setIsUpdating(true)
    try {
      console.log('✅ Aceitando report:', report.id)
      
      const updatedReport = await updateReportStatus(
        report.id, 
        'completed', 
        'Ajustes aceitos pelo administrador'
      )
      
      if (updatedReport) {
        console.log('✅ Report aceito com sucesso')
        // Recarregar lista de reports
        await loadReports(true)
        
        // Disparar evento para notificar outros componentes
        window.dispatchEvent(new CustomEvent('report-status-updated', { 
          detail: { reportId: report.id, status: 'completed' } 
        }))
      }
    } catch (error) {
      console.error('❌ Erro ao aceitar report:', error)
      alert('Erro ao aceitar report. Tente novamente.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Função para abrir modal de rejeição
  const handleRejectReport = (report: Report) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Apenas administradores podem rejeitar reports')
      return
    }
    
    setSelectedReport(report)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  // Função para confirmar rejeição
  const handleConfirmRejection = async () => {
    if (!selectedReport || !rejectReason.trim()) {
      alert('Por favor, informe o motivo da rejeição')
      return
    }

    setIsUpdating(true)
    try {
      console.log('❌ Rejeitando report:', selectedReport.id, 'Motivo:', rejectReason)
      
      const updatedReport = await updateReportStatus(
        selectedReport.id, 
        'rejected', 
        rejectReason.trim()
      )
      
      if (updatedReport) {
        console.log('✅ Report rejeitado com sucesso')
        
        // Fechar modal
        setRejectModalOpen(false)
        setSelectedReport(null)
        setRejectReason('')
        
        // Recarregar lista de reports
        await loadReports(true)
        
        // Disparar evento para notificar outros componentes
        window.dispatchEvent(new CustomEvent('report-status-updated', { 
          detail: { reportId: selectedReport.id, status: 'rejected' } 
        }))
      }
    } catch (error) {
      console.error('❌ Erro ao rejeitar report:', error)
      alert('Erro ao rejeitar report. Tente novamente.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Função para cancelar rejeição
  const handleCancelRejection = () => {
    setRejectModalOpen(false)
    setSelectedReport(null)
    setRejectReason('')
  }

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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing || loading}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} />
            <span>
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('🔍 [DEBUG] Informações do usuário:', user)
              console.log('🔍 [DEBUG] Reports atuais:', reports)
              console.log('🔍 [DEBUG] Loading state:', loading)
              console.log('🔍 [DEBUG] IsRefreshing state:', isRefreshing)
              alert(`Debug Info:\nUser ID: ${user?.id}\nUser Role: ${user?.role}\nReports Count: ${reports.length}\nLoading: ${loading}`)
            }}
            size="sm"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Debug</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <p className="text-sm text-gray-600">Aceitos</p>
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
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.status === 'rejected').length}
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptReport(report)}
                          disabled={isUpdating}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectReport(report)}
                          disabled={isUpdating}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
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

                {/* Status de Aprovação/Rejeição */}
                {(report.status === 'completed' || report.status === 'rejected') && (
                  <div className={`mt-3 p-3 rounded border ${
                    report.status === 'completed' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {report.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        report.status === 'completed' 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {report.status === 'completed' 
                          ? 'Ajustes Aceitos pelo Admin' 
                          : 'Ajustes Rejeitados pelo Admin'
                        }
                      </p>
                    </div>
                    {report.completed_at && (
                      <p className={`text-xs ${
                        report.status === 'completed' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Processado em: {new Date(report.completed_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(report.completed_at).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Rejeição */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              Rejeitar Report
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Report: {selectedReport.vaga?.titulo || selectedReport.vaga?.cargo} - {selectedReport.vaga?.cliente}
                </p>
                <p className="text-xs text-gray-500">
                  Campo: {getFieldLabel(selectedReport.field_name)}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reject-reason" className="text-sm font-medium">
                Motivo da Rejeição *
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Explique o motivo da rejeição deste report..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelRejection}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmRejection}
                disabled={isUpdating || !rejectReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isUpdating ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
