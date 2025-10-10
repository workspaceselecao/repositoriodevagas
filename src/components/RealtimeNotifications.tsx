import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Report } from '../types/database'
import { getPendingReportsForAdmin } from '../lib/reports'
import { useAuth } from '../contexts/AuthContext'

interface RealtimeNotificationsProps {
  onNewReport?: (report: Report) => void
  onReportUpdate?: (report: Report) => void
}

export default function RealtimeNotifications({ 
  onNewReport, 
  onReportUpdate 
}: RealtimeNotificationsProps) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return

    console.log('🔔 Iniciando notificações em tempo real para admin:', user.email)

    // Configurar subscription para reports
    const reportsSubscription = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'reports'
        },
        async (payload: any) => {
          console.log('🔔 Mudança detectada em reports:', payload)

          try {
            // Buscar o report completo com relacionamentos
            const { data: report, error } = await supabase
              .from('reports')
              .select(`
                *,
                vaga:vagas(*),
                reporter:users!reports_reported_by_fkey(*),
                assignee:users!reports_assigned_to_fkey(*)
              `)
              .eq('id', payload.new?.id || payload.old?.id)
              .single()

            if (error) {
              console.error('Erro ao buscar report:', error)
              return
            }

            // Verificar se o report é para este admin
            if (report && report.assigned_to === user.id) {
              switch (payload.eventType) {
                case 'INSERT':
                  console.log('🔔 Novo report recebido:', report)
                  onNewReport?.(report)
                  
                  // Mostrar notificação do navegador se disponível
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Novo Report Recebido', {
                      body: `Report de ${report.reporter?.name} sobre ${report.vaga?.titulo}`,
                      icon: '/favicon.ico',
                      tag: `report-${report.id}`
                    })
                  }
                  break

                case 'UPDATE':
                  console.log('🔔 Report atualizado:', report)
                  onReportUpdate?.(report)
                  break

                case 'DELETE':
                  console.log('🔔 Report deletado:', payload.old)
                  break
              }
            }
          } catch (error) {
            console.error('Erro ao processar mudança em tempo real:', error)
          }
        }
      )
      .subscribe((status: any) => {
        console.log('🔔 Status da subscription:', status)
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status === 'CHANNEL_ERROR') {
          console.error('🔔 Erro no canal, tentando reconectar...')
          setTimeout(() => {
            if (!isConnected) {
              // Recriar subscription se desconectado
              console.log('🔔 Tentando reconectar...')
            }
          }, 5000)
        }
      })

    // Solicitar permissão para notificações do navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('🔔 Permissão de notificação:', permission)
      })
    }

    return () => {
      console.log('🔔 Desconectando notificações em tempo real')
      if (reportsSubscription) {
        try {
          reportsSubscription.unsubscribe()
        } catch (error) {
          console.error('🔔 Erro ao desconectar subscription:', error)
        }
      }
    }
  }, [user?.id, user?.role, user?.email, onNewReport, onReportUpdate])

  // Componente invisível - apenas gerencia as notificações
  return null
}

// Hook para usar notificações em tempo real
export function useRealtimeNotifications() {
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const loadPendingReports = async () => {
    if (!user || user.role !== 'ADMIN') return

    try {
      setIsLoading(true)
      const reports = await getPendingReportsForAdmin(user.id)
      setPendingReports(reports)
    } catch (error) {
      console.error('Erro ao carregar reports pendentes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewReport = (report: Report) => {
    setPendingReports(prev => [report, ...prev])
  }

  const handleReportUpdate = (updatedReport: Report) => {
    setPendingReports(prev => 
      prev.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      )
    )
  }

  useEffect(() => {
    // Só carregar reports pendentes se o usuário for admin e estiver autenticado
    if (user && user.role === 'ADMIN') {
      loadPendingReports()
    }
  }, [user?.id, user?.role])

  return {
    pendingReports,
    isLoading,
    loadPendingReports,
    handleNewReport,
    handleReportUpdate
  }
}
