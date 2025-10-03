import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Report } from '../types/database'
import { Bell, Clock, User, FileText, Eye, ArrowRight, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationsListProps {
  pendingReports: Report[]
  isLoading: boolean
  onRefresh: () => void
}

export default function NotificationsList({ 
  pendingReports, 
  isLoading, 
  onRefresh 
}: NotificationsListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  }

  const getFieldLabel = (fieldName: string) => {
    const fieldLabels: { [key: string]: string } = {
      'site': 'Site',
      'categoria': 'Categoria',
      'cargo': 'Cargo',
      'cliente': 'Cliente',
      'titulo': 'Título',
      'descricao_vaga': 'Descrição da vaga',
      'responsabilidades_atribuicoes': 'Responsabilidades e atribuições',
      'requisitos_qualificacoes': 'Requisitos e qualificações',
      'salario': 'Salário',
      'horario_trabalho': 'Horário de Trabalho',
      'jornada_trabalho': 'Jornada de Trabalho',
      'beneficios': 'Benefícios',
      'local_trabalho': 'Local de Trabalho',
      'etapas_processo': 'Etapas do processo'
    }
    return fieldLabels[fieldName] || fieldName
  }

  const handleViewAllReports = () => {
    setIsOpen(false)
    navigate('/dashboard/reports')
  }

  const handleReportClick = (reportId: string) => {
    setIsOpen(false)
    navigate(`/dashboard/reports?report=${reportId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
          {pendingReports.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {pendingReports.length > 99 ? '99+' : pendingReports.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[90vw] max-w-4xl h-[85vh] max-h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Notificações de Reports
              {pendingReports.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingReports.length} pendente{pendingReports.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Atualizar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleViewAllReports}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Todos
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Lista de reports */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Carregando reports...</p>
                </div>
              </div>
            ) : pendingReports.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum report pendente</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Você será notificado quando houver novos reports
                </p>
                <Button
                  variant="outline"
                  onClick={handleViewAllReports}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ir para Reports
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {pendingReports.map((report, index) => (
                  <div key={report.id}>
                    <div 
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                      onClick={() => handleReportClick(report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Header do report */}
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">
                              {getFieldLabel(report.field_name)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {report.status}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Informações da vaga */}
                          <div className="mb-3">
                            <p className="font-semibold text-sm mb-1 line-clamp-1">
                              {report.vaga?.titulo || report.vaga?.cargo || 'Vaga sem título'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.vaga?.cliente} • {report.vaga?.site}
                            </p>
                          </div>

                          {/* Sugestões */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                              {report.suggested_changes}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{report.reporter?.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(report.created_at)}</span>
                              </div>
                            </div>
                            <span className="text-xs text-blue-600 group-hover:text-blue-700">
                              Clique para ver detalhes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < pendingReports.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
