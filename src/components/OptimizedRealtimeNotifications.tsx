// Sistema de Notificações em Tempo Real Otimizado
// Evita conexões/desconexões constantes e melhora estabilidade

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Report } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import { useIntelligentCache } from '../lib/intelligent-cache'

interface OptimizedRealtimeNotificationsProps {
  onNewReport?: (report: Report) => void
  onReportUpdate?: (report: Report) => void
  onDataChange?: (type: string, data: any) => void
}

interface ConnectionState {
  isConnected: boolean
  lastConnected: number
  reconnectAttempts: number
  maxReconnectAttempts: number
}

export default function OptimizedRealtimeNotifications({ 
  onNewReport, 
  onReportUpdate,
  onDataChange
}: OptimizedRealtimeNotificationsProps) {
  const { user } = useAuth()
  const cache = useIntelligentCache()
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastConnected: 0,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  })
  
  const subscriptionsRef = useRef<Map<string, any>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Função para reconectar com backoff exponencial
  const reconnect = useCallback(async () => {
    if (connectionState.reconnectAttempts >= connectionState.maxReconnectAttempts) {
      console.warn('🚫 Máximo de tentativas de reconexão atingido')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, connectionState.reconnectAttempts), 30000)
    console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${connectionState.reconnectAttempts + 1})`)
    
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }))

    reconnectTimeoutRef.current = setTimeout(() => {
      initializeRealtime()
    }, delay)
  }, [connectionState.reconnectAttempts, connectionState.maxReconnectAttempts])

  // Função para processar mudanças em tempo real
  const processRealtimeChange = useCallback(async (payload: any, type: string) => {
    try {
      console.log(`🔔 Mudança detectada em ${type}:`, payload)

      // Invalidar cache relacionado
      cache.invalidateByDependency(type)

      // Processar baseado no tipo
      switch (type) {
        case 'reports':
          await processReportChange(payload)
          break
        case 'vagas':
          await processVagaChange(payload)
          break
        case 'users':
          await processUserChange(payload)
          break
        default:
          console.log(`🔔 Mudança em ${type} processada`)
      }

      // Notificar componentes
      onDataChange?.(type, payload)

    } catch (error) {
      console.error(`❌ Erro ao processar mudança em ${type}:`, error)
    }
  }, [cache, onDataChange])

  // Processar mudanças em reports
  const processReportChange = useCallback(async (payload: any) => {
    try {
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
      if (report && report.assigned_to === user?.id) {
        switch (payload.eventType) {
          case 'INSERT':
            console.log('🔔 Novo report recebido:', report)
            onNewReport?.(report)
            
            // Mostrar notificação do navegador
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
      console.error('Erro ao processar mudança em reports:', error)
    }
  }, [user?.id, onNewReport, onReportUpdate])

  // Processar mudanças em vagas
  const processVagaChange = useCallback(async (payload: any) => {
    console.log('🔔 Mudança em vagas detectada, invalidando cache')
    cache.invalidateByDependency('vagas')
  }, [cache])

  // Processar mudanças em usuários
  const processUserChange = useCallback(async (payload: any) => {
    console.log('🔔 Mudança em usuários detectada, invalidando cache')
    cache.invalidateByDependency('usuarios')
  }, [cache])

  // Configurar subscription para uma tabela
  const setupSubscription = useCallback((table: string, eventTypes: string[] = ['INSERT', 'UPDATE', 'DELETE']) => {
    const channelName = `${table}_changes`
    
    // Remover subscription existente se houver
    const existingSubscription = subscriptionsRef.current.get(channelName)
    if (existingSubscription) {
      existingSubscription.unsubscribe()
      subscriptionsRef.current.delete(channelName)
    }

    console.log(`🔔 Configurando subscription para ${table}...`)

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload: any) => processRealtimeChange(payload, table)
      )
      .subscribe((status: any) => {
        console.log(`🔔 Status da subscription ${table}:`, status)
        
        if (status === 'SUBSCRIBED') {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            lastConnected: Date.now(),
            reconnectAttempts: 0
          }))
          subscriptionsRef.current.set(channelName, subscription)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`⚠️ Erro na subscription ${table}:`, status)
          setConnectionState(prev => ({
            ...prev,
            isConnected: false
          }))
          reconnect()
        }
      })

    return subscription
  }, [processRealtimeChange, reconnect])

  // Inicializar sistema de tempo real
  const initializeRealtime = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') {
      console.log('🔔 Usuário não é admin, pulando inicialização de tempo real')
      return
    }

    if (isInitializedRef.current) {
      console.log('🔔 Sistema de tempo real já inicializado')
      return
    }

    console.log('🔔 Iniciando sistema de tempo real otimizado para admin:', user.email)

    try {
      // Configurar subscriptions para tabelas importantes
      setupSubscription('reports')
      setupSubscription('vagas')
      setupSubscription('users')

      // Configurar heartbeat para manter conexão viva
      heartbeatIntervalRef.current = setInterval(() => {
        if (!connectionState.isConnected) {
          console.log('💓 Heartbeat: conexão perdida, tentando reconectar...')
          reconnect()
        }
      }, 30000) // A cada 30 segundos

      // Solicitar permissão para notificações do navegador
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('🔔 Permissão de notificação:', permission)
        })
      }

      isInitializedRef.current = true
      console.log('✅ Sistema de tempo real otimizado inicializado')

    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de tempo real:', error)
      reconnect()
    }
  }, [user, setupSubscription, connectionState.isConnected, reconnect])

  // Limpar subscriptions
  const cleanup = useCallback(() => {
    console.log('🔔 Limpando sistema de tempo real...')
    
    // Limpar subscriptions
    for (const [channelName, subscription] of subscriptionsRef.current.entries()) {
      console.log(`🔔 Desconectando subscription: ${channelName}`)
      subscription.unsubscribe()
    }
    subscriptionsRef.current.clear()

    // Limpar timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    setConnectionState({
      isConnected: false,
      lastConnected: 0,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    })

    isInitializedRef.current = false
  }, [])

  // Efeito principal
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      initializeRealtime()
    }

    return cleanup
  }, [user?.id, initializeRealtime, cleanup])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Componente invisível - apenas gerencia as notificações
  return null
}

// Hook para usar notificações em tempo real otimizadas
export function useOptimizedRealtimeNotifications() {
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const cache = useIntelligentCache()

  const handleNewReport = useCallback((report: Report) => {
    setPendingReports(prev => [report, ...prev])
  }, [])

  const handleReportUpdate = useCallback((updatedReport: Report) => {
    setPendingReports(prev => 
      prev.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      )
    )
  }, [])

  const handleDataChange = useCallback((type: string, data: any) => {
    console.log(`🔔 Dados atualizados via tempo real: ${type}`, data)
    // O cache já foi invalidado automaticamente
  }, [])

  return {
    pendingReports,
    isLoading,
    handleNewReport,
    handleReportUpdate,
    handleDataChange,
    connectionState: {
      isConnected: true, // Será atualizado pelo componente principal
      lastConnected: Date.now()
    }
  }
}
