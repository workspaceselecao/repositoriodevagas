import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Report } from '../types/database'
import { getReportsForRealtime } from '../lib/reports'

// =============================================
// HOOK PARA NOTIFICAÇÕES EM TEMPO REAL
// =============================================

export function useRealtimeReports(adminId: string | null) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [newReportCount, setNewReportCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  // Carregar reports iniciais
  useEffect(() => {
    if (!adminId) {
      setLoading(false)
      return
    }

    const loadInitialReports = async () => {
      try {
        console.log('🔄 Carregando reports iniciais para admin:', adminId)
        const initialReports = await getReportsForRealtime(adminId)
        setReports(initialReports)
        setNewReportCount(0)
        console.log('✅ Reports iniciais carregados:', initialReports.length)
      } catch (error) {
        console.error('❌ Erro ao carregar reports iniciais:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialReports()
  }, [adminId])

  // Configurar subscription em tempo real
  useEffect(() => {
    if (!adminId) return

    console.log('🔌 Conectando ao canal de reports em tempo real...')

    const channel = supabase
      .channel(`reports_${adminId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
          filter: `assigned_to=eq.${adminId}`
        },
        async (payload: any) => {
          console.log('🔔 Novo report recebido:', payload.new)
          setNewReportCount(prev => prev + 1)
          
          // Recarregar reports para ter os dados completos
          try {
            const updatedReports = await getReportsForRealtime(adminId)
            setReports(updatedReports)
            console.log('✅ Reports atualizados:', updatedReports.length)
          } catch (error) {
            console.error('❌ Erro ao recarregar reports:', error)
          }
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
        async (payload: any) => {
          console.log('🔄 Report atualizado:', payload.new)
          
          // Atualizar report específico na lista
          setReports(prevReports => 
            prevReports.map(report => 
              report.id === payload.new.id ? payload.new as Report : report
            )
          )
        }
      )
      .subscribe((status: any) => {
        console.log('📡 Status da conexão:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('🔌 Desconectando do canal de reports...')
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [adminId])

  const clearNewReportCount = () => {
    setNewReportCount(0)
  }

  const refreshReports = async () => {
    if (!adminId) return
    
    try {
      console.log('🔄 Atualizando reports manualmente...')
      const updatedReports = await getReportsForRealtime(adminId)
      setReports(updatedReports)
      console.log('✅ Reports atualizados:', updatedReports.length)
    } catch (error) {
      console.error('❌ Erro ao atualizar reports:', error)
    }
  }

  return {
    reports,
    loading,
    newReportCount,
    isConnected,
    clearNewReportCount,
    refreshReports
  }
}

// =============================================
// HOOK PARA NOTIFICAÇÕES GERAIS
// =============================================

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'report' | 'update'
    message: string
    timestamp: Date
    reportId?: string
    adminId?: string
  }>>([])

  useEffect(() => {
    console.log('🔔 Configurando notificações em tempo real...')

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
          console.log('🔔 Nova notificação de report:', payload.new)
          
          const newNotification = {
            id: `notification-${Date.now()}`,
            type: 'report' as const,
            message: `Novo report recebido para ${payload.new.field_name}`,
            timestamp: new Date(),
            reportId: payload.new.id,
            adminId: payload.new.assigned_to
          }
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Manter apenas 10 notificações
        }
      )
      .subscribe((status: any) => {
        console.log('📡 Status das notificações:', status)
      })

    return () => {
      console.log('🔔 Desconectando notificações...')
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

// =============================================
// HOOK PARA DETECTAR LOGIN DE ADMIN
// =============================================

export function useAdminLoginDetection() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null)

  useEffect(() => {
    // Detectar mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔐 Mudança de autenticação:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Verificar se é um admin
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('id, role')
              .eq('id', session.user.id)
              .single()

            if (!error && userData && userData.role === 'ADMIN') {
              console.log('👑 Admin fez login:', userData.id)
              setAdminLoggedIn(true)
              setLoggedInAdmin(userData.id)
              
              // Verificar se há reports pendentes para este admin
              setTimeout(async () => {
                try {
                  const pendingReports = await getReportsForRealtime(userData.id)
                  if (pendingReports.length > 0) {
                    console.log('📋 Admin tem reports pendentes:', pendingReports.length)
                    // Aqui você pode mostrar uma notificação ou popup
                  }
                } catch (error) {
                  console.error('❌ Erro ao verificar reports pendentes:', error)
                }
              }, 1000)
            }
          } catch (error) {
            console.error('❌ Erro ao verificar role do usuário:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Admin fez logout')
          setAdminLoggedIn(false)
          setLoggedInAdmin(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    adminLoggedIn,
    loggedInAdmin
  }
}