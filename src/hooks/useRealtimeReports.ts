import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Report } from '../types/database'
import { getPendingReportsForAdmin } from '../lib/reports'

export function useRealtimeReports(adminId: string | null) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [newReportCount, setNewReportCount] = useState(0)

  // Carregar reports iniciais
  useEffect(() => {
    if (!adminId) {
      setLoading(false)
      return
    }

    const loadInitialReports = async () => {
      try {
        const initialReports = await getPendingReportsForAdmin(adminId)
        setReports(initialReports)
        setNewReportCount(0)
      } catch (error) {
        console.error('Erro ao carregar reports iniciais:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialReports()
  }, [adminId])

  // Configurar subscription em tempo real
  useEffect(() => {
    if (!adminId) return

    const channel = supabase
      .channel('reports_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
          filter: `assigned_to=eq.${adminId}`
        },
        (payload: any) => {
          setNewReportCount(prev => prev + 1)
          
          // Recarregar reports para ter os dados completos
          getPendingReportsForAdmin(adminId).then(newReports => {
            setReports(newReports)
          }).catch(error => {
            console.error('Erro ao recarregar reports:', error)
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
          filter: `assigned_to=eq.${adminId}`
        },
        (payload: any) => {
          // Atualizar report específico na lista
          setReports(prevReports => 
            prevReports.map(report => 
              report.id === payload.new.id ? payload.new as Report : report
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [adminId])

  const clearNewReportCount = () => {
    setNewReportCount(0)
  }

  const refreshReports = async () => {
    if (!adminId) return
    
    try {
      const updatedReports = await getPendingReportsForAdmin(adminId)
      setReports(updatedReports)
    } catch (error) {
      console.error('Erro ao atualizar reports:', error)
    }
  }

  return {
    reports,
    loading,
    newReportCount,
    clearNewReportCount,
    refreshReports
  }
}

// Hook para notificações em tempo real
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'report' | 'update'
    message: string
    timestamp: Date
    reportId?: string
  }>>([])

  useEffect(() => {
    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports'
        },
        (payload: any) => {
          const newNotification = {
            id: `notification-${Date.now()}`,
            type: 'report' as const,
            message: `Novo report recebido para ${payload.new.field_name}`,
            timestamp: new Date(),
            reportId: payload.new.id
          }
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]) // Manter apenas 5 notificações
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    removeNotification,
    clearAllNotifications
  }
}
