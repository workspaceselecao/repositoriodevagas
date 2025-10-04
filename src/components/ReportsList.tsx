import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Vaga, Report } from '../types/database'
import { getReportsByUser, updateReportStatus, deleteReport } from '../lib/reports'
import { updateVaga } from '../lib/vagas'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Eye, CheckCircle, XCircle, Clock, User, RefreshCw, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

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

  // Efeito adicional para tentar carregar reports se a lista estiver vazia após 2 segundos
  useEffect(() => {
    if (!user || loading) return
    
    const timer = setTimeout(() => {
      if (reports.length === 0 && !isRefreshing) {
        console.log('🔄 [ReportsList] Tentando recarregar reports após timeout...')
        loadReports(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [user, reports.length, loading, isRefreshing])

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

  // Função para aceitar report (abre modal de edição focada)
  const handleAcceptReport = (report: Report) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Apenas administradores podem aceitar reports')
      return
    }

    console.log('✅ Abrindo modal de edição para report:', report.id)
    
    // Abrir modal de edição focada no campo reportado
    if (report.vaga?.id) {
      setSelectedReport(report)
      
      // Pré-preencher o campo com a sugestão do report
      const initialFormData: any = {}
      if (report.suggested_changes) {
        initialFormData[report.field_name] = report.suggested_changes
      }
      setEditFormData(initialFormData)
      
      setEditModalOpen(true)
    } else {
      console.error('❌ ID da vaga não encontrado no report')
      alert('Erro: ID da vaga não encontrado')
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

  // Função para abrir modal de exclusão
  const handleDeleteReport = (report: Report) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Apenas administradores podem deletar reports')
      return
    }
    
    setReportToDelete(report)
    setDeleteModalOpen(true)
  }

  // Função para confirmar exclusão
  const handleConfirmDeletion = async () => {
    if (!reportToDelete) return

    setIsUpdating(true)
    try {
      console.log('🗑️ Limpando registro do report:', reportToDelete.id)
      
      const success = await deleteReport(reportToDelete.id)
      
      if (success) {
        console.log('✅ Registro do report limpo com sucesso')
        
        // Fechar modal
        setDeleteModalOpen(false)
        setReportToDelete(null)
        
        // Recarregar lista de reports
        await loadReports(true)
        
        // Disparar evento para notificar outros componentes
        window.dispatchEvent(new CustomEvent('report-deleted', { 
          detail: { reportId: reportToDelete.id } 
        }))
      }
    } catch (error) {
      console.error('❌ Erro ao deletar report:', error)
      alert('Erro ao deletar report. Tente novamente.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Função para cancelar exclusão
  const handleCancelDeletion = () => {
    setDeleteModalOpen(false)
    setReportToDelete(null)
  }

  // Função para fechar modal de edição
  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedReport(null)
    setEditFormData({})
  }

  // Função para aceitar alterações (salvar mudanças)
  const handleAcceptChanges = async () => {
    if (!selectedReport || !selectedReport.vaga || !user) return

    setIsUpdating(true)
    try {
      console.log('✅ Aceitando alterações da vaga:', selectedReport.vaga.id)
      
      // Preparar dados da vaga com as alterações
      const vagaData = {
        ...selectedReport.vaga,
        ...editFormData
      }
      
      // Atualizar a vaga no banco de dados
      const updatedVaga = await updateVaga(selectedReport.vaga.id, vagaData, user.id)
      
      if (updatedVaga) {
        // Marcar o report como concluído
        await updateReportStatus(
          selectedReport.id, 
          'completed', 
          'Ajustes aceitos e implementados pelo administrador'
        )
        
        console.log('✅ Vaga atualizada e report marcado como concluído')
        
        // Fechar modal
        handleCloseEditModal()
        
        // Recarregar lista de reports
        await loadReports(true)
        
        // Disparar evento para notificar outros componentes
        window.dispatchEvent(new CustomEvent('report-status-updated', { 
          detail: { reportId: selectedReport.id, status: 'completed' } 
        }))
        
        // Disparar evento para atualizar vagas em outras páginas
        window.dispatchEvent(new CustomEvent('vaga-updated', { 
          detail: { vagaId: selectedReport.vaga.id, updatedVaga } 
        }))
      } else {
        alert('Erro ao atualizar vaga')
      }
    } catch (error) {
      console.error('❌ Erro ao aceitar alterações:', error)
      alert('Erro ao aceitar alterações. Tente novamente.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Função para rejeitar alterações (manter informações originais)
  const handleRejectChanges = async () => {
    if (!selectedReport || !user) return

    setIsUpdating(true)
    try {
      console.log('❌ Rejeitando alterações do report:', selectedReport.id)
      
      // Marcar o report como rejeitado sem fazer alterações na vaga
      await updateReportStatus(
        selectedReport.id, 
        'rejected', 
        'Ajustes rejeitados pelo administrador - mantidas informações originais'
      )
      
      console.log('✅ Report marcado como rejeitado')
      
      // Fechar modal
      handleCloseEditModal()
      
      // Recarregar lista de reports
      await loadReports(true)
      
      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('report-status-updated', { 
        detail: { reportId: selectedReport.id, status: 'rejected' } 
      }))
    } catch (error) {
      console.error('❌ Erro ao rejeitar alterações:', error)
      alert('Erro ao rejeitar alterações. Tente novamente.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Função para atualizar dados do formulário
  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
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
                    {user?.role === 'ADMIN' && report.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteReport(report)}
                        disabled={isUpdating}
                        className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Apagar
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

      {/* Modal de Edição Focada */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Editar Vaga - Campo Reportado
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedReport && selectedReport.vaga && (
              <>
                {/* Informações do Report */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Informações do Report</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Vaga:</span>
                      <p className="text-blue-600">{selectedReport.vaga.titulo || selectedReport.vaga.cargo} - {selectedReport.vaga.cliente}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Campo Reportado:</span>
                      <p className="text-blue-600">{getFieldLabel(selectedReport.field_name)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Valor Atual:</span>
                      <p className="text-blue-600 bg-white p-2 rounded border text-xs">{selectedReport.current_value || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Sugestão:</span>
                      <p className="text-blue-600 bg-white p-2 rounded border text-xs">{selectedReport.suggested_changes || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">📋 Instruções</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• O campo foi pré-preenchido com a sugestão do RH</li>
                    <li>• Você pode editar o valor antes de aceitar ou rejeitar</li>
                    <li>• <strong>Aceitar</strong>: Aplica as alterações na vaga e conclui o report</li>
                    <li>• <strong>Rejeitar</strong>: Mantém a vaga como está e marca o report como rejeitado</li>
                  </ul>
                </div>

                {/* Formulário de Edição */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Editar Campo: {getFieldLabel(selectedReport.field_name)}</h3>
                  
                  {/* Campo Reportado - Ativo */}
                  <div className="space-y-2">
                    <Label htmlFor={`edit-${selectedReport.field_name}`} className="text-sm font-medium">
                      {getFieldLabel(selectedReport.field_name)} *
                    </Label>
                    {selectedReport.field_name.includes('descricao') || 
                     selectedReport.field_name.includes('responsabilidades') || 
                     selectedReport.field_name.includes('requisitos') || 
                     selectedReport.field_name.includes('beneficios') ? (
                      <Textarea
                        id={`edit-${selectedReport.field_name}`}
                        value={editFormData[selectedReport.field_name] || selectedReport.vaga[selectedReport.field_name as keyof Vaga] || ''}
                        onChange={(e) => handleEditFormChange(selectedReport.field_name, e.target.value)}
                        rows={4}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        placeholder="Digite o novo valor..."
                      />
                    ) : (
                      <Input
                        id={`edit-${selectedReport.field_name}`}
                        value={editFormData[selectedReport.field_name] || selectedReport.vaga[selectedReport.field_name as keyof Vaga] || ''}
                        onChange={(e) => handleEditFormChange(selectedReport.field_name, e.target.value)}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        placeholder="Digite o novo valor..."
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Valor atual:</span> {selectedReport.current_value || 'Não informado'}
                      </p>
                      <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border">
                        <span className="font-medium">✅ Pré-preenchido com sugestão:</span> {selectedReport.suggested_changes || 'Não informado'}
                      </p>
                    </div>
                  </div>

                  {/* Campos Desabilitados - Apenas para visualização */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedReport.vaga).map(([key, value]) => {
                      if (key === selectedReport.field_name || key === 'id' || key === 'created_at' || key === 'updated_at') return null
                      
                      return (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs text-gray-500">{getFieldLabel(key)}</Label>
                          <Input
                            value={value || ''}
                            disabled
                            className="bg-gray-50 text-gray-500"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCloseEditModal}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleRejectChanges}
                    disabled={isUpdating}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isUpdating ? 'Rejeitando...' : 'Rejeitar'}
                  </Button>
                  <Button
                    onClick={handleAcceptChanges}
                    disabled={isUpdating}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isUpdating ? 'Aceitando...' : 'Aceitar'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Limpar Registro do Histórico
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {reportToDelete && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-1">
                  Report: {reportToDelete.vaga?.titulo || reportToDelete.vaga?.cargo} - {reportToDelete.vaga?.cliente}
                </p>
                <p className="text-xs text-red-600">
                  Campo: {getFieldLabel(reportToDelete.field_name)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Status: {reportToDelete.status === 'completed' ? 'Concluído' : reportToDelete.status}
                </p>
              </div>
            )}
            
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Esta ação vai limpar este registro do histórico de Reports
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                O registro do report será permanentemente removido do banco de dados.
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelDeletion}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeletion}
                disabled={isUpdating}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isUpdating ? 'Limpando...' : 'Limpar Registro'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
